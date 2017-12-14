import { IMessageHub, TOPIC_TEST_COMPLETED, TOPIC_TESTRESULT_CHANGED } from '../../IMessageHub';
import { ITestResult, TestResultComperator } from '../domain/ITest';
import { MongoClient, Db } from 'mongodb';

const MONGODB_NAME: string = 'eventstore';
const MONGODB_COLLECTION_TESTS: string = 'tests';

export interface IModuleStoreConfiguration {
    mongoDbUrl: string;
}

export class ModuleStore {
    constructor(private config: IModuleStoreConfiguration, private pubsub: IMessageHub) {
        pubsub.subscribe(TOPIC_TEST_COMPLETED, (message: string, data: any) => {
            this.storeTest(data as ITestResult);
            console.log('Storing test', data);
        });
    }

    private storeTest(testResult: ITestResult) {
        this.withMongoDb((db, closeConnection) => {
            const collection = db.collection(MONGODB_COLLECTION_TESTS);
            
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
        MongoClient.connect(this.config.mongoDbUrl, (error, client) => {
            if (error)
                throw error;
            callback(client.db(MONGODB_NAME), () => {
                client.close();
            });
        }); 
    }
}