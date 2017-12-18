import * as request from 'request';

import { ITask } from './ITask';
import { ITest, TestResult, ITestResult } from '../../domain/ITest'

export class HttpPostTask implements ITask
{
    public name: string = 'http-post';

    action(test: ITest, callback: (result: ITestResult) => void) {

        request.post(test.endpoint, test.options, (error: any, response: request.RequestResponse, body: any) => {
            let success = true;
            if (!response)
                success = false;
            else if (test.expects.statusCode && test.expects.statusCode !== response.statusCode) {
                success = false;
            }

            const testData = {
                error,
                statusCode: response ? response.statusCode : 0
            };

            callback(new TestResult(success, test.name, testData));
        });
    }
}