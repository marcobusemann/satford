import * as GlobalPubSub from 'pubsub-js';
import { IMessageHub } from '../../IMessageHub';

export class PubSub implements IMessageHub {
    static TOPIC_TEST_COMPLETED: string = "test.completed"; 
    static TOPIC_TESTRESULT_CHANGED: string = "test.testresultchanged"; 

    publish(message: any, data: any): boolean {
        return GlobalPubSub.publish(message, data);
    }

    subscribe(message: any, func: Function): any {
        return GlobalPubSub.subscribe(message, func);
    }
}