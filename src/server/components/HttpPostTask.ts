import * as request from "request-promise";

import { ISchedulableTask } from "./ISchedulableTask";
import { ITestResult } from "../../shared/ITestResult";
import { ITest } from "../../shared/ITest";
import { TestResult } from "../../shared/TestResult";

export interface IHttpPostOptions {
    endpoint: string;
    expectedStatusCode: number;
    additionalOptions: any;
}

export class HttpPostTask implements ISchedulableTask {
    public name: string = "http-post";

    async execute(test: ITest): Promise<ITestResult> {
        const data = test.options as IHttpPostOptions;

        const requestOptions = {
            method: "POST",
            uri: data.endpoint,
            resolveWithFullResponse: true,
            simple: false,
        };

        try {
            const result = await request({
                ...requestOptions,
                ...data.additionalOptions
            });
            const success = data.expectedStatusCode === result.statusCode;
            return new TestResult(success, test.name, {
                statusCode: result.statusCode
            });                    
        } catch (error) {
            return new TestResult(false, test.name, {
                error: error.message
            });                    
        }
    }
}
