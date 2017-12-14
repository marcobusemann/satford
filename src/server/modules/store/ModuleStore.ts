import { Express } from 'express';
import { PubSub } from '../pubsub/PubSub';
import { ITestResult, TestResultComperator } from '../domain/ITest';
import { MongoClient, Db } from 'mongodb';

import * as _ from 'lodash';

export class ModuleStore {
    private db: Db = null;

    constructor(private app: Express, private pubsub: PubSub) {

        MongoClient.connect(process.env.MONGODB_URL, (error, client) => {
            if (error)
                throw error;
            this.db = client.db('eventstore');
            console.log('Module store running...');
        }); 

        pubsub.subscribe(PubSub.TOPIC_TEST_COMPLETED, (message: string, data: any) => {
            this.storeTest(data as ITestResult);
            console.log('Storing test', data);
        });
    }

    private storeTest(testResult: ITestResult) {
        const collection = this.db.collection('tests');

        collection.insertOne(testResult, (error, result) => {
            if (error)
                return console.log(error);

            collection
                .find({ testName: testResult.testName })
                .sort({ timestamp: -1 })
                .limit(2)
                .toArray((error, documents) => {
                    if (error)
                        return console.log(error);

                    if (documents.length <= 1)
                        return console.log('Did not found two tests for', testResult);

                    const comp = new TestResultComperator(
                        documents[0] as ITestResult, 
                        documents[1] as ITestResult);

                    console.log('Comparing two tests: ', documents[0], documents[1]);

                    if (!comp.equal())
                        this.pubsub.publish(PubSub.TOPIC_TESTRESULT_CHANGED, testResult);
                });
        });
    }
}