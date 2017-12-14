import * as GlobalPubSub from 'pubsub-js';
import { IMessageHub } from '../../IMessageHub';

export class PubSub implements IMessageHub {
    publish(message: any, data: any): boolean {
        return GlobalPubSub.publish(message, data);
    }

    subscribe(message: any, func: Function): any {
        return GlobalPubSub.subscribe(message, func);
    }
}