import * as agendash from 'agendash';
import * as Agenda from 'agenda';

import { Express } from 'express';
import { ITask } from './tasks/ITask';
import { ITest, ITestResult } from '../domain/ITest';
import { Tasks } from './tasks/Tasks';
import { PubSub } from '../pubsub/PubSub';
import { readFileSync } from 'fs';

const fs = require('fs');

export class ModuleAgenda {
    private agenda: Agenda;
    private pubsub: PubSub;

    constructor(app: Express, pubsub: PubSub) {
        this.pubsub = pubsub;
        this.agenda = new Agenda()
            .database(process.env.MONGODB_URL, 'agendaJobs')
            .processEvery('30 seconds')
            .defaultLockLifetime(30000);
        
        this.agenda.on('ready', () => {
            const configFile = JSON.parse(readFileSync('./config.json', 'utf-8')) as ITest[];
            this.registerTasks();
            this.importTests(configFile);
            this.agenda.purge();
            this.agenda.start();
            console.log('Agenda running...');
        });
    
        this.agenda.on('error', (error) => {
            console.log(error);
        });

        app.use('/agenda', agendash(this.agenda));
    }

    private registerTasks() {
        const tasks = new Tasks();
        tasks.forEach((task: ITask) => {
            this.agenda.define(task.name, (job, done) => {
                const test = job.attrs.data as ITest;
                task.action(test, (result: ITestResult) => {
                    this.pubsub.publish(PubSub.TOPIC_TEST_COMPLETED, result);
                    done();
                });
            });
            console.log(`Registered task ${task.name}`);
        });
    }

    private importTests(tests: ITest[]) {
        tests.forEach((test: ITest) => {
            if (test.isActive)
            {
                this.agenda.now(test.type, test);
                this.agenda.every(test.frequency, test.type, test);
                console.log(`Scheduled job ${test.name}`, test);
            }
        });
    }
}