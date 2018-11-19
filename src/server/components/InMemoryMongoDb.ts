import { IMongoDb, IRunningMongoDb } from "./IMongoDb";
import MongoInMemory from "mongodb-memory-server";

export class InMemoryMongoDb implements IMongoDb {
    private server: any = null;

    async running(): Promise<IRunningMongoDb> {
        if (this.server)
            return this.runningDb();

        this.server = new MongoInMemory();
        return this.runningDb();
    }

    async runningDb(): Promise<IRunningMongoDb> {
        const runningDb: IRunningMongoDb = {
            url: await this.server.getConnectionString()
        };
        return runningDb;
    }
}
