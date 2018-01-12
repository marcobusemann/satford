import { ITestResult, ITest, TestResultComperator } from '../domain/ITest';
import * as _ from 'lodash';

export class ChangeDetection
{
    constructor(private allowedFails: number) {}

    hasStateChanged(results: ITestResult[]): boolean {
        if (results.length === 0) return false;
        if (results.length === 1)
            return !results[0].success;
        return this.firstIsAAndElseIsB(true, false, results) || this.firstIsAAndElseIsB(true, false, results.reverse());
    }

    private firstIsAAndElseIsB(a: boolean, b: boolean, results: ITestResult[]): boolean
    {
        const top = _.head(results);
        const tail = _.tail(results);
        return top.success == a && _.every(tail, e => e.success == b);
    }
}