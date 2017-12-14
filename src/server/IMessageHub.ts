export interface IMessageHub {
    publish(message: any, data: any): boolean;
    subscribe(message: any, func: Function): any;
}

export const TOPIC_TEST_COMPLETED: string = "test.completed"; 
export const TOPIC_TESTRESULT_CHANGED: string = "test.testresultchanged"; 
