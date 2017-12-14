import * as GlobalPubSub from 'pubsub-js';
import { IMessageHub, IMessage } from '../../IMessageHub';

export class PubSub implements IMessageHub {
    publish<T = any>(message: string, data: T): boolean {
        return GlobalPubSub.publish(message, data);
    }

    subscribe<T = any>(message: string, func: (message: string, data: T) => void): any {
        return GlobalPubSub.subscribe(message, func);
    }
}