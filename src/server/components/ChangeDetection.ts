import { IMessageHub } from "./IMessageHub";
import {
    TEST_RESULT_SAVED,
    ITestResultSavedData,
    ITestStateChangedData,
    TEST_STATE_CHANGED
} from "./Messages";
import { ChangeDetectableTestResults } from "./ChangeDetectableTestResults";
import { ILastTestResults } from './ILastTestResults';
import * as moment from 'moment';

export class ChangeDetection {
    constructor(
        private lastTestResults: ILastTestResults,
        private messageHub: IMessageHub) {
    }

    public async start() {
        this.messageHub.subscribe<ITestResultSavedData>(
            TEST_RESULT_SAVED,
            (message, data) => this.detectStateChange(data)
        );
    }

    private detectStateChange = async (data: ITestResultSavedData) => {
        const { test, result } = data;

        if (test.allowedDowntimeRanges) {
            const resultMoment = moment(result.timestamp);
            for (const range of test.allowedDowntimeRanges) {
                const rangeStart = moment(range.start, 'HH:mm');
                const rangeEnd = moment(range.end, 'HH:mm');
                const downtimeWasExpected = resultMoment.isBetween(rangeStart, rangeEnd);
                if (downtimeWasExpected) {
                    console.log(`Expected downtime (${rangeStart.format('L LT')}, ${rangeEnd.format('L LT')}) did match for ${test.name} (${resultMoment.format('L LT')})!`);
                    return;
                } 
                else
                    console.log(`Expected downtime (${rangeStart.format('L LT')}, ${rangeEnd.format('L LT')}) did NOT match for ${test.name} (${resultMoment.format('L LT')})!`);
            }
        }

        const allowedFails = test.allowedFails || 0;
        const amountOfResultsToCompare = allowedFails + 2;

        const lastResults = await this.lastTestResults.last(test.name, amountOfResultsToCompare);
        const changeDetection = new ChangeDetectableTestResults(lastResults);

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
