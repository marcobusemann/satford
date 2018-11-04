import * as ping from 'ping-wrapper2';
import { ISchedulableTask } from './ISchedulableTask';
import { ITest } from '../../shared/ITest';
import { ITestResult } from '../../shared/ITestResult';
import { TestResult } from '../../shared/TestResult';

export interface IPingOptions {
    host: string;
}

export class PingTask implements ISchedulableTask
{
    public name: string = 'ping';

    execute(test: ITest): Promise<ITestResult> {
        const options = test.options as IPingOptions;

        const exec = ping(options.host, { count: 1 });

        return new Promise<ITestResult>((resolve, reject) => {
            exec.on("exit", (data) => {
                resolve(new TestResult(data.recieved === 1, test.name))
            });
        });
    }
}