export interface IMessage<T> {
    name: string;
    data: T;
}

export interface IMessageHub {
    publish<T = any>(message: string, data: T): boolean;
    subscribe<T = any>(
        message: string,
        func: (message: string, data: T) => void
    ): any;
}
