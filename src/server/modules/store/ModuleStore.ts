import { IMessageHub, TOPIC_TEST_COMPLETED, TOPIC_TESTRESULT_CHANGED, ITestCompletedData, ITestResultChangedData } from '../../IMessageHub';
import { ITestResult, TestResultComperator } from '../domain/ITest';
import { MongoClient, Db } from 'mongodb';

const MONGODB_NAME: string = 'eventstore';
const MONGODB_COLLECTION_TESTS: string = 'tests';

export interface IModuleStoreConfiguration {
    mongoDbUrl: string;
}

export class ModuleStore {
    constructor(private config: IModuleStoreConfiguration, private pubsub: IMessageHub) {
        pubsub.subscribe<ITestCompletedData>(TOPIC_TEST_COMPLETED, (message, data) => {
            this.storeTest(data);
        });
    }

    private storeTest(data: ITestCompletedData) {
        console.log('Storing test...', data);
        
        this.withMongoDb((db, closeConnection) => {
            const collection = db.collection(MONGODB_COLLECTION_TESTS);
            
            collection.insertOne(data.result, (error, result) => {
                if (error)
                    return console.log(error);
    
                collection
                    .find({ testName: data.test.name })
                    .sort({ timestamp: -1 })
                    .limit(2)
                    .toArray((error, documents) => {

                        closeConnection();

                        if (error)
                            return console.log(error);
    
                        if (documents.length === 1 && !data.result.success)
                            this.pubsub.publish<ITestResultChangedData>(TOPIC_TESTRESULT_CHANGED, data);
                        else if (documents.length <= 1)
                            return console.log('Did not found two tests for', data.test.name);
    
                        const comp = new TestResultComperator(
                            documents[0] as ITestResult, 
                            documents[1] as ITestResult);
    
                        console.log('Comparing two tests: ', documents[0], documents[1]);
    
                        if (!comp.equal())
                            this.pubsub.publish<ITestResultChangedData>(TOPIC_TESTRESULT_CHANGED, data);
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