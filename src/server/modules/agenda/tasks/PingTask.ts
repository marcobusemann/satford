import { ITask } from './ITask';
import { ITest, TestResult, ITestResult } from '../../domain/ITest'
import * as ping from 'ping-wrapper2';

export class PingTask implements ITask
{
    public name: string = 'ping';

    action(test: ITest, callback: (result: ITestResult) => void) {
        const exec = ping(test.endpoint, { count: 1 });
        exec.on("exit", (data) => {
            callback(new TestResult(data.recieved === 1, test.name));
        });
    }
}