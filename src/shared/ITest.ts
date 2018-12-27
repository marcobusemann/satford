import { ITestResult } from "./ITestResult";

export interface ITimeRange {
    start: string;
    end: string;
}

export interface ITest {
    isActive: boolean;
    name: string;
    type: string;
    frequency: string;
    allowedFails?: number;
    allowedDowntimeRanges?: ITimeRange[];
    options: any;
}

export class FakeTest implements ITest {
    isActive: boolean;
    type: string;
    frequency: string;
    allowedFails?: number;
    options: any;

    constructor(public name: string) {}
}

export interface ITestsAndLastResults {
    tests: ITest[];
    results: { [index: string]: ITestResult };
}
