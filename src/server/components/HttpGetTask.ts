import * as request from "request-promise";

import { ISchedulableTask } from "./ISchedulableTask";
import { ITestResult } from "../../shared/ITestResult";
import { ITest } from "../../shared/ITest";
import { TestResult } from "../../shared/TestResult";

export interface IHttpGetOptions {
    endpoint: string;
    expectedStatusCode: number;
}

export class HttpGetTask implements ISchedulableTask {
    public name: string = "http-get";

    async execute(test: ITest): Promise<ITestResult> {
        const data = test.options as IHttpGetOptions;

        const requestOptions = {
            method: "GET",
            uri: data.endpoint,
            resolveWithFullResponse: true
        };
        try {
            const result = await request(requestOptions);            
            const success = data.expectedStatusCode === result.statusCode;
            return new TestResult(success, test.name, {
                statusCode: result.statusCode
            });    
        } catch (error) {
            return new TestResult(false, test.name, {
                error: error.message,
            });    
        }
    }
}
