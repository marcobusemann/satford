import * as agendash from 'agendash';
import * as Agenda from 'agenda';

import { Express } from 'express';
import { ITask } from './tasks/ITask';
import { ITest, ITestResult } from '../domain/ITest';
import { IMessageHub, TOPIC_TEST_COMPLETED } from '../../IMessageHub';
import { readFileSync } from 'fs';

import { HttpGetTask } from './tasks/HttpGetTask';

export class ModuleAgenda {
    private agenda: Agenda;
    private pubsub: IMessageHub;
    private tasks: ITask[] = [];

    constructor(app: Express, pubsub: IMessageHub) {
        this.tasks.push(new HttpGetTask());

        this.pubsub = pubsub;
        this.agenda = new Agenda()
            .database(process.env.MONGODB_URL, 'agendaJobs')
            .processEvery('30 seconds')
            .defaultLockLifetime(30000);
        
        this.agenda.on('ready', () => {
            this.registerTasks();
            this.importTests();
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
        this.tasks.forEach((task: ITask) => {
            this.agenda.define(task.name, (job, done) => {
                const test = job.attrs.data as ITest;
                task.action(test, (result: ITestResult) => {
                    this.pubsub.publish(TOPIC_TEST_COMPLETED, result);
                    done();
                });
            });
            console.log(`Registered task ${task.name}`);
        });
    }

    private importTests() {
        const tests = JSON.parse(readFileSync(process.env.CONFIG_FILE, 'utf-8')) as ITest[];        
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