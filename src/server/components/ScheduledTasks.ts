import * as Agenda from "agenda";

import { IMessageHub } from "./IMessageHub";
import { ISchedulableTask } from "./ISchedulableTask";
import { HttpGetTask } from "./HttpGetTask";
import { HttpPostTask } from "./HttpPostTask";
import { PingTask } from "./PingTask";
import { ITest } from "../../shared/ITest";
import {
    TEST_CREATED,
    SCHEDULED_TEST_FINISHED,
    TEST_SCHEDULED,
    ITestCreatedData,
    ITestScheduledData,
    ITestFinishedData
} from "./Messages";
import { IRunningMongoDb } from "./IMongoDb";
import { IConfiguration } from "./IConfiguration";

export interface IScheduledTasksConfiguration {
    mongoDbUrl: string;
}

export class ScheduledTasks {
    public agenda: Agenda;
    private tasks: ISchedulableTask[] = [];

    constructor(
        private configuration: IConfiguration,
        private messageHub: IMessageHub
    ) {
        this.tasks.push(new HttpGetTask());
        this.tasks.push(new HttpPostTask());
        this.tasks.push(new PingTask());
    }

    public async start(): Promise<void> {
        const mongoDb = await this.configuration.mongodb();
        const running = await mongoDb.running();
        return await this.spinupAgenda(running);
    }

    private spinupAgenda(runningMongoDb: IRunningMongoDb) {
        return new Promise<void>((resolve, reject) => {
            console.log(`Connecting agenda to ${runningMongoDb.url}.`);

            this.agenda = new Agenda()
                .database(runningMongoDb.url, "agendaJobs")
                .processEvery("30 seconds")
                .defaultLockLifetime(30000);

            this.agenda.on("ready", async () => {
                await this.agenda.purge();
                await this.agenda.start();

                console.log("Agenda is now ready, watching for events...");
                this.messageHub.subscribe<ITestCreatedData>(
                    TEST_CREATED,
                    (_, data) => this.importTest(data.test)
                );
                resolve();
            });

            this.agenda.on("error", error => {
                console.log(error);
                reject(error);
            });
        });
    }

    private importTest = (test: ITest) => {
        if (!test.isActive) return;

        const jobName = `${test.name}.${test.type}`;
        this.agenda.define(jobName, this.executeJob);
        this.agenda.every(test.frequency, jobName, test);

        this.messageHub.publish<ITestScheduledData>(TEST_SCHEDULED, {
            jobName,
            test
        });

        console.log(`Scheduled job ${jobName} for ${test.name}`);
    };

    private executeJob = async (job, done) => {
        const test = job.attrs.data as ITest;
        const task = this.tasks.find(task => test.type === task.name);

        if (!task) return console.log("Type not available", test.type);

        const result = await task.execute(test);

        this.messageHub.publish<ITestFinishedData>(SCHEDULED_TEST_FINISHED, {
            test,
            result
        });

        console.log(`Executed job ${test.name}.`, result);
        done();
    };
}
