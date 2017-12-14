import * as agendash from 'agendash';
import * as Agenda from 'agenda';

import { IExpress } from '../../IExpress';
import { ITask } from './tasks/ITask';
import { ITest, ITestResult } from '../domain/ITest';
import { IMessageHub, TOPIC_TEST_COMPLETED, ITestCompletedData } from '../../IMessageHub';

import { HttpGetTask } from './tasks/HttpGetTask';

export interface IModuleAgendaConfiguration {
    mongoDbUrl: string;
    tests: ITest[];
} 

export class ModuleAgenda {
    private agenda: Agenda;
    private pubsub: IMessageHub;
    private tasks: ITask[] = [];

    constructor(private config: IModuleAgendaConfiguration, app: IExpress, pubsub: IMessageHub) {
        this.tasks.push(new HttpGetTask());

        this.pubsub = pubsub;
        this.agenda = new Agenda()
            .database(this.config.mongoDbUrl, 'agendaJobs')
            .processEvery('30 seconds')
            .defaultLockLifetime(30000);
        
        this.agenda.on('ready', () => {
            this.registerTasks();
            this.importTests();
            this.agenda.purge();
            this.agenda.start();
        });
    
        this.agenda.on('error', (error) => {
            console.log(error);
        });

        app.use('/agenda', agendash(this.agenda));
    }

    private registerTasks() {
        console.log('Available tasks:', this.tasks.map((task) => task.name));
        this.tasks.forEach((task: ITask) => {
            this.agenda.define(task.name, (job, done) => {
                const test = job.attrs.data as ITest;
                task.action(test, (result: ITestResult) => {
                    this.pubsub.publish<ITestCompletedData>(TOPIC_TEST_COMPLETED, {
                        test,
                        result
                    });
                    done();
                });
            });
        });
    }

    private importTests() {
        this.config.tests.forEach((test: ITest) => {
            if (test.isActive)
            {
                this.agenda.now(test.type, test);
                this.agenda.every(test.frequency, test.type, test);
                console.log(`Scheduled job ${test.name}`, test);
            }
        });
    }
}