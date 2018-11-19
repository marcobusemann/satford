import { IMongoDb, IRunningMongoDb } from "./IMongoDb";

export class ExternalMongoDb implements IMongoDb {
    constructor(private url: string) {}

    async running(): Promise<IRunningMongoDb> {
        return {
            url: this.url
        };
    }
}
