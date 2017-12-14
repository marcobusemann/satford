import * as request from 'request';

import { ITask } from './ITask';
import { ITest, TestResult, ITestResult } from '../../domain/ITest'

export class HttpGetTask implements ITask
{
    public name: string = 'http-get';

    action(test: ITest, callback: (result: ITestResult) => void) {
        request(test.endpoint, (error, response, body) => {
            let success = true;
            if (!response)
                success = false;
            else if (test.expects.statusCode && test.expects.statusCode !== response.statusCode) {
                success = false;
            }

            let testData = {
                error,
                statusCode: response ? response.statusCode : 0
            };

            callback(new TestResult(success, test.name, testData));
        });
    }
}