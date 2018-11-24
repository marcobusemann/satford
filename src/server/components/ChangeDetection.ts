import { IMessageHub } from "./IMessageHub";
import {
    TEST_RESULT_SAVED,
    ITestResultSavedData,
    ITestStateChangedData,
    TEST_STATE_CHANGED
} from "./Messages";
import { ChangeDetectableTestResults } from "./ChangeDetectableTestResults";
import { MongoTestResult } from "./MongoTestResult";

export class ChangeDetection {
    constructor(private messageHub: IMessageHub) {
    }

    public async start() {
        this.messageHub.subscribe<ITestResultSavedData>(
            TEST_RESULT_SAVED,
            (message, data) => this.detectStateChange(data)
        );
    }

    private detectStateChange = async (data: ITestResultSavedData) => {
        const allowedFails = data.test.allowedFails || 0;
        const amountOfResultsToCompare = allowedFails + 2;

        const lastResult = await MongoTestResult.find({ name: data.test.name })
            .sort({ timestamp: -1 })
            .limit(amountOfResultsToCompare);
        const changeDetection = new ChangeDetectableTestResults(lastResult);

        if (changeDetection.hasStateChanged())
        {
            this.messageHub.publish<ITestStateChangedData>(
                TEST_STATE_CHANGED,
                data
            );
            console.log("Test result has changed", data);
        }
    };
}
