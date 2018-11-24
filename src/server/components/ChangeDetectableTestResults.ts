import * as _ from 'lodash';
import { ITestResult } from '../../shared/ITestResult';

export class ChangeDetectableTestResults
{
    constructor(private results: ITestResult[]) {}

    hasStateChanged(): boolean {
        if (this.results.length === 0) return false;
        if (this.results.length === 1)
            return !this.results[0].success;
        return this.firstIsAAndElseIsB(true, false, this.results) || this.firstIsAAndElseIsB(true, false, this.results.reverse());
    }

    private firstIsAAndElseIsB(a: boolean, b: boolean, results: ITestResult[]): boolean
    {
        const top = _.head(results);
        const tail = _.tail(results);
        return top.success == a && _.every(tail, e => e.success == b);
    }
}