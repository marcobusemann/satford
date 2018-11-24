import { IMessageHub } from "./IMessageHub";
import {
    ITestFinishedData,
    SCHEDULED_TEST_FINISHED,
    ITestResultSavedData,
    TEST_RESULT_SAVED
} from "./Messages";
import * as mongoose from "mongoose";
import { MongoTestResult } from "./MongoTestResult";
import { IMongoDb } from './IMongoDb';

export class PersistedTestResults {
    constructor(
        private mongoDb: IMongoDb,
        private messageHub: IMessageHub
    ) {}

    public async start() {
        const runningMongoDb = await this.mongoDb.running();
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
