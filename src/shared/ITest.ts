import { ITestResult } from "./ITestResult";

export interface ITest {
    isActive: boolean;
    name: string;
    type: string;
    frequency: string;
    allowedFails?: number;
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
