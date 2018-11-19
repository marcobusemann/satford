export interface IMongoDb {
    running(): Promise<IRunningMongoDb>;
}

export interface IRunningMongoDb {
    url: string;
}
