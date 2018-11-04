import * as Agenda from 'agenda';

import { IMessageHub } from './IMessageHub';
import { ISchedulableTask } from './ISchedulableTask';

export interface IScheduledTasksConfiguration {
    mongoDbUrl: string;
    //tests: ITest[];
} 

export class ScheduledTasks {
    public agenda: Agenda;
    private tasks: ISchedulableTask[] = [];

    constructor(
        private mongoDbUrl: string, 
        private messageHub: IMessageHub) {

        this.tasks.push(new HttpGetTask());
        this.tasks.push(new HttpPostTask());
        this.tasks.push(new PingTask());

        this.agenda = new Agenda()
            .database(this.mongoDbUrl, 'agendaJobs')
            .processEvery('30 seconds')
            .defaultLockLifetime(30000);
        
        this.agenda.on('ready', () => {
            //this.importTests();
            this.agenda.purge();
            this.agenda.start();
        });
    
        this.agenda.on('error', (error) => {
            console.log(error);
            // TODO: Add error handling
        });
    }
/*
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

                //this.agenda.now(jobName, test);
                this.agenda.every(test.frequency, jobName, test);
                console.log(`Scheduled job ${jobName} for ${test.name}`);
            }
        });

        this.pubsub.publish<ITestsChangedData>(TOPIC_TESTS_CHANGED, {
            tests: this.config.tests
        })
    }
    */
}