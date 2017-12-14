import { ITest, ITestResult } from '../../domain/ITest'

export interface ITask {
    name: string;
    action: (job: ITest, callback: (result: ITestResult) => void) => void; 
}
