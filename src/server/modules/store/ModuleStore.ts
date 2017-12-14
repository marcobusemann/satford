import { IMessageHub, TOPIC_TEST_COMPLETED, TOPIC_TESTRESULT_CHANGED } from '../../IMessageHub';
import { ITestResult, TestResultComperator } from '../domain/ITest';
import { MongoClient, Db } from 'mongodb';

import * as _ from 'lodash';

export class ModuleStore {
    constructor(private pubsub: IMessageHub) {
        pubsub.subscribe(TOPIC_TEST_COMPLETED, (message: string, data: any) => {
            this.storeTest(data as ITestResult);
            console.log('Storing test', data);
        });

        console.log('Module store running...');
    }

    private storeTest(testResult: ITestResult) {
        this.withMongoDb((db, closeConnection) => {
            const collection = db.collection('tests');
            
            collection.insertOne(testResult, (error, result) => {
                if (error)
                    return console.log(error);
    
                collection
                    .find({ testName: testResult.testName })
                    .sort({ timestamp: -1 })
                    .limit(2)
                    .toArray((error, documents) => {

                        closeConnection();

                        if (error)
                            return console.log(error);
    
                        if (documents.length <= 1)
                            return console.log('Did not found two tests for', testResult);
    
                        const comp = new TestResultComperator(
                            documents[0] as ITestResult, 
                            documents[1] as ITestResult);
    
                        console.log('Comparing two tests: ', documents[0], documents[1]);
    
                        if (!comp.equal())
                            this.pubsub.publish(TOPIC_TESTRESULT_CHANGED, testResult);
                    });
            });
        });
    }

    private withMongoDb(callback: (db: Db, closeConnection: () => void) => void) {
        MongoClient.connect(process.env.MONGODB_URL, (error, client) => {
            if (error)
                throw error;
            callback(client.db('eventstore'), () => {
                client.close();
            });
        }); 
    }
}