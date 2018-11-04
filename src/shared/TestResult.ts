import { ITestResult } from './ITestResult';

export class TestResult implements ITestResult {
    timestamp: Date;

    constructor(
        public success: boolean, 
        public name: string, 
        public data?: any) {
        this.timestamp = new Date();
    }
}