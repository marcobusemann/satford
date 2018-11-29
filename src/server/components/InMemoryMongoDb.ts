import { IMongoDb, IRunningMongoDb } from "./IMongoDb";

export class InMemoryMongoDb implements IMongoDb {
    private server: any = null;

    async running(): Promise<IRunningMongoDb> {
        if (this.server)
            return this.runningDb();

        const MongoInMemory = require('mongodb-memory-server').MongoMemoryServer;
        this.server = new MongoInMemory();
        return this.runningDb();
    }

    private async runningDb(): Promise<IRunningMongoDb> {
        const runningDb: IRunningMongoDb = {
            url: await this.server.getConnectionString()
        };
        return runningDb;
    }
}
