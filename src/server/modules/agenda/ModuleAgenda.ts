import * as agendash from 'agendash';
import * as Agenda from 'agenda';

import { IExpress } from '../../IExpress';
import { ITask } from './tasks/ITask';
import { ITest, ITestResult } from '../domain/ITest';
import { IMessageHub, TOPIC_TEST_COMPLETED, ITestCompletedData, TOPIC_TESTS_CHANGED, ITestsChangedData } from '../../IMessageHub';

import { HttpGetTask } from './tasks/HttpGetTask';
import { PingTask } from './tasks/PingTask';

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
        this.tasks.push(new PingTask());

        this.pubsub = pubsub;
        this.agenda = new Agenda()
            .database(this.config.mongoDbUrl, 'agendaJobs')
            .processEvery('30 seconds')
            .defaultLockLifetime(30000);
        
        this.agenda.on('ready', () => {
            this.importTests();
            this.agenda.purge();
            this.agenda.start();
        });
    
        this.agenda.on('error', (error) => {
            console.log(error);
        });

        app.use('/agenda', agendash(this.agenda));
    }

    private importTests() {
        this.config.tests.forEach((test: ITest) => {
            const task = this.tasks.find((task) => test.type === task.name);
            if (!task)
                console.log('Type not available', test.type);
            else if (test.isActive)
            {
                const jobName = `${test.name}.${task.name}`;
                this.agenda.define(jobName, (job, done) => {
                    const test = job.attrs.data as ITest;
                    task.action(test, (result: ITestResult) => {
                        this.pubsub.publish<ITestCompletedData>(TOPIC_TEST_COMPLETED, {
                            test,
                            result
                        });
                        done();
                    });
                });

                this.agenda.now(jobName, test);
                this.agenda.every(test.frequency, jobName, test);
                console.log(`Scheduled job ${jobName}`, test);
            }
        });

        this.pubsub.publish<ITestsChangedData>(TOPIC_TESTS_CHANGED, {
            tests: this.config.tests
        })
    }
}