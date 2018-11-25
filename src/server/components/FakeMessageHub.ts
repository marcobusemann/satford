import { IMessageHub } from "./IMessageHub";

interface FakeMessageHubMessage {
    message: string;
    data: any;
}

interface FakeMessageHubSubscription {
    message: string;
    func: (message: string, data: any) => void;
}

export class FakeMessageHub implements IMessageHub {
    public messages: FakeMessageHubMessage[] = [];
    private subscriptions: FakeMessageHubSubscription[] = [];

    publish<T = any>(message: string, data: T): boolean {
        this.messages.push({ message, data });
        for (const subscription of this.subscriptions) {
            if (subscription.message === message)
                subscription.func(message, data);
        }
        return true;
    }

    subscribe<T = any>(
        message: string,
        func: (message: string, data: T) => void
    ) {
        this.subscriptions.push({ message, func });
    }
}
