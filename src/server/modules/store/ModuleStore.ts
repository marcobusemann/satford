import { IMessageHub, TOPIC_TEST_COMPLETED, TOPIC_TESTRESULT_CHANGED, ITestCompletedData, ITestResultChangedData, ITestsChangedData, TOPIC_TESTS_CHANGED } from '../../IMessageHub';
import { IExpress } from '../../IExpress';
import { ITest, ITestResult, TestResultComperator } from '../domain/ITest';
import { MongoClient, Db } from 'mongodb';

import { TestPageHtml } from './TestsPage';

const MONGODB_NAME: string = 'eventstore';
const MONGODB_COLLECTION_TESTS: string = 'tests';

export interface IModuleStoreConfiguration {
    mongoDbUrl: string;
}

export class ModuleStore {
    private tests: ITest[];

    constructor(private config: IModuleStoreConfiguration, private express: IExpress, private pubsub: IMessageHub) {
        pubsub.subscribe<ITestCompletedData>(TOPIC_TEST_COMPLETED, (message, data) => {
            this.storeTest(data);
        });

        pubsub.subscribe<ITestsChangedData>(TOPIC_TESTS_CHANGED, (message, data) => {
            this.tests = data.tests;
        })

        express.use('/tests', (request, response) => {
            this.withMongoDb((db, closeConnection) => {
                const collection = db.collection(MONGODB_COLLECTION_TESTS);

                collection
                    .find()
                    .toArray((error, documents: ITestResult[]) => {

                        closeConnection();

                        response.send(TestPageHtml(this.tests, documents));
                    });
            });
        });
    }

    private storeTest(data: ITestCompletedData) {
        console.log('Storing test result...');
        
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
    
                        const document1 = documents[0] as ITestResult;
                        const document2 = documents[1] as ITestResult;
                        const comp = new TestResultComperator(document1, document2);
    
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