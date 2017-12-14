import { ITest, ITestResult } from './modules/domain/ITest';

export interface IMessage<T> {
    name: string;
    data: T;
}
export interface IMessageHub {
    publish<T = any>(message: string, data: T): boolean;
    subscribe<T = any>(message: string, func: (message: string, data: T) => void): any;
}

export const TOPIC_TEST_COMPLETED: string = "test.completed"; 
export interface ITestCompletedData {
    test: ITest;
    result: ITestResult;
}

export const TOPIC_TESTRESULT_CHANGED: string = "test.testresultchanged"; 
export interface ITestResultChangedData extends ITestCompletedData {
}