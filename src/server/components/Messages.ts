import { ITest } from "../../shared/ITest";
import { ITestResult } from "../../shared/ITestResult";

export const TEST_CREATED = "TEST_CREATED";
export interface ITestCreatedData {
    test: ITest;
}

export const TEST_SCHEDULED = "TEST_SCHEDULED";
export interface ITestScheduledData {
    jobName: string;
    test: ITest;
}

export const SCHEDULED_TEST_FINISHED = "SCHEDULED_TEST_FINISHED";
export interface ITestFinishedData {
    result: ITestResult;
    test: ITest;
}
