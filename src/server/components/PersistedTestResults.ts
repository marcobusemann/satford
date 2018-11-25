import { IMessageHub } from "./IMessageHub";
import {
    ITestFinishedData,
    SCHEDULED_TEST_FINISHED,
    ITestResultSavedData,
    TEST_RESULT_SAVED
} from "./Messages";
import * as mongoose from "mongoose";
import { MongoTestResult } from "./MongoTestResult";
import { IConfiguration } from './IConfiguration';

export class PersistedTestResults {
    constructor(
        private configuration: IConfiguration,
        private messageHub: IMessageHub
    ) {}

    public async start() {
        const mongoDb = await this.configuration.mongodb();
        const runningMongoDb = await mongoDb.running();
        await mongoose.connect(runningMongoDb.url);

        this.messageHub.subscribe<ITestFinishedData>(
            SCHEDULED_TEST_FINISHED,
            (message, data) => this.storeTestResult(data)
        );
    }

    private storeTestResult = async (data: ITestFinishedData) => {
        const testResult = new MongoTestResult(data.result);
        await testResult.save();

        this.messageHub.publish<ITestResultSavedData>(TEST_RESULT_SAVED, data);
    };
}
