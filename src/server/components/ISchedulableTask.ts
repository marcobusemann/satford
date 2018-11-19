import { ITestResult } from "../../shared/ITestResult";
import { ITest } from "../../shared/ITest";

export interface ISchedulableTask {
    name: string;
    execute: (test: ITest) => Promise<ITestResult>;
}
