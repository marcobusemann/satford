export interface ITestExpectation
{
    statusCode?: number;
}

export interface ITest
{
    isActive: boolean;
    name: string;
    endpoint: string;
    type: string;
    expects: ITestExpectation;
    frequency: string;
    options: any;
    allowedFails?: number;
}

export interface ITestResult {
    success: boolean;
    testName: string;
    data?: any;
    timestamp?: Date;
}

export class TestResult implements ITestResult {
    constructor(public success: boolean, public testName: string, public data?: any, public timestamp?: Date) {
        if (!this.timestamp)
            this.timestamp = new Date();
    }
}

export class TestResultComperator {
    constructor(private a: ITestResult, private b: ITestResult) {}

    equal() {
        return this.a.success === this.b.success;
    }
}