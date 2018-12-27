import { ITestResult } from '../../shared/ITestResult';

export interface ILastTestResults {
    last(testName: string, amount: number): Promise<ITestResult[]>;
}