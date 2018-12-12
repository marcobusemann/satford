import { IConfiguration, IMattermostConfigurationData } from "./IConfiguration";
import { ITest } from "../../shared/ITest";
import { IMattermost } from "./IMattermost";
import { DebugMattermost } from "./DebugMattermost";
import { InMemoryMongoDb } from "./InMemoryMongoDb";
import { IMongoDb } from "./IMongoDb";
import * as mongoose from "mongoose";
import { MongoTestResult } from "./MongoTestResult";
import * as moment from "moment";
import { ITestResult } from "../../shared/ITestResult";

export class DebugConfiguration implements IConfiguration {
    private initialized: boolean = false;

    async tests(): Promise<ITest[]> {
        return [
            {
                name: "google.de (unsecure)",
                frequency: "1 minute",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "http://google.de",
                    expectedStatusCode: 200
                }
            },{
                name: "google.de",
                frequency: "1 minute",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "https://google.de",
                    expectedStatusCode: 200
                }
            },{
                name: "microsoft.de",
                frequency: "30 seconds",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "https://www.microsoft.com",
                    expectedStatusCode: 200
                }
            },{
                name: "treesoft.de",
                frequency: "1 minute",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "https://www.treesoft.de",
                    expectedStatusCode: 200
                }
            },
            {
                name: "local demo service",
                frequency: "30 seconds",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "http://localhost:4000",
                    expectedStatusCode: 200
                }
            }
        ];
    }

    async mattermost(): Promise<IMattermost> {
        return new DebugMattermost();
    }

    public async mongodb(): Promise<IMongoDb> {
        const inMemoryDb = new InMemoryMongoDb();

        if (this.initialized) return inMemoryDb;

        console.log("Initializing demo data");

        const running = await inMemoryDb.running();
        const tests = await this.tests();

        await mongoose.connect(running.url);
        await MongoTestResult.deleteMany({});

        for (const test of tests) {
            const today = moment();

            const totalDays = 50;
            for (let index = 0; index < totalDays; index++) {
                const currentDay = today.clone().subtract(index, "days");
    
                const testsPerDay = Math.floor(Math.random() * 20 + 4);
                for (let testDay = 0; testDay < testsPerDay; testDay++) {
                    const wasSuccessfull = Math.floor(Math.random() * 2 + 1) === 1;
                    const testResult: ITestResult = {
                        timestamp: currentDay
                            .clone()
                            .startOf("day")
                            .add(testDay, "minutes")
                            .toDate(),
                        name: test.name,
                        success: wasSuccessfull,
                        data: { statusCode: wasSuccessfull ? 200 : 500 }
                    };
                    await MongoTestResult.create(testResult);
                }
            }
        }

        this.initialized = true;

        return inMemoryDb;
    }
}
