import { IConfiguration, IMattermostConfigurationData } from "./IConfiguration";
import { ITest } from "../../shared/ITest";
import { IMattermost } from './IMattermost';
import { DebugMattermost } from './DebugMattermost';
import { InMemoryMongoDb } from './InMemoryMongoDb';
import { IMongoDb } from './IMongoDb';
import * as mongoose from "mongoose";
import { MongoTestResult } from './MongoTestResult';
import * as moment from 'moment';
import { ITestResult } from '../../shared/ITestResult';

export class DebugConfiguration implements IConfiguration {
    async tests(): Promise<ITest[]> {
        return [
            {
                name: "google.de",
                frequency: "10 seconds",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "http://google.de",
                    expectedStatusCode: 200
                }
            },
            {
                name: "localhost demo service",
                frequency: "10 seconds",
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
        const running = await inMemoryDb.running();
    
        await mongoose.connect(running.url);
        console.log('debug, connect');

        await MongoTestResult.deleteMany({});
        console.log('debug, deletaMany');

        const today = moment();

        const totalDays = 10;
        for (let index = 0; index < totalDays; index++) {
            const currentDay = today.clone().subtract(index, 'days');

            const testsPerDay = Math.floor((Math.random() * 30) + 10);
            for (let test = 0; test < testsPerDay; test++) {
                const successGoogle = Math.floor((Math.random() * 2) + 1) === 1;
                const testResultGoogle: ITestResult = {
                    timestamp: currentDay.clone().startOf('day').add(test, 'hours').toDate(),
                    name: 'google.de',
                    success: successGoogle,
                    data: { statusCode: successGoogle ? 200 : 500 }
                };
                await MongoTestResult.create(testResultGoogle);
                
                const successOther = Math.floor((Math.random() * 2) + 1) === 1;
                const testResultOther: ITestResult = {
                    timestamp: currentDay.clone().startOf('day').add(test, 'hours').toDate(),
                    name: 'localhost demo service',
                    success: successOther,
                    data: { statusCode: successGoogle ? 200 : 500 }
                };
                await MongoTestResult.create(testResultOther);    
            }
        }

        return inMemoryDb;
    }
}
