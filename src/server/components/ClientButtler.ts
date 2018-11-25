import { Server as SocketIOServer } from "socket.io";
import { IMessageHub } from "./IMessageHub";
import { ITest, ITestsAndLastResults } from "../../shared/ITest";
import { ITestCreatedData, TEST_CREATED, ITestFinishedData, SCHEDULED_TEST_FINISHED } from "./Messages";
import { ITestResult } from '../../shared/ITestResult';
import { MongoTestResult } from './MongoTestResult';

export class ClientButtler {
    private tests: ITest[] = [];
    private lastTestResults: {[index:string] : ITestResult} = {};

    constructor(
        private server: SocketIOServer,
        private messageHub: IMessageHub
    ) {}

    public async start() {
        this.messageHub.subscribe<ITestCreatedData>(
            TEST_CREATED,
            (message, data) => this.memorizeTest(data)
        );

        this.messageHub.subscribe<ITestFinishedData>(
            SCHEDULED_TEST_FINISHED,
            (message, data) => this.memorizeTestResult(data)
        );

        this.server.on("connection", socket => {
            console.log("Client connected");
            socket.emit("HELLO");

            const testsWithResults: ITestsAndLastResults = {
                tests: this.tests, 
                results: this.lastTestResults
            }
            socket.emit("TESTS", testsWithResults);

            socket.on("RESULTS_FOR_TEST", async (testName) => {
                const results = await this.gatherResultsForTest(testName);
                socket.emit("RECEIVE_RESULTS_FOR_TEST", results);
            });
        });
    }

    private async memorizeTest(data: ITestCreatedData) {
        this.tests.push(data.test);
        this.server.emit("TEST_CREATED", data.test);
    }

    private async memorizeTestResult(data: ITestFinishedData) {
        this.lastTestResults[data.test.name] = data.result;
        console.log('memorizeTestResult', data.result);
        this.server.emit("TEST_FINISHED", data.result);
    }

    private async gatherResultsForTest(testName: string): Promise<ITestResult[]> {
        const results = await MongoTestResult.find({ name: testName })
            .sort({ timestamp: -1 })
            .limit(200);
        return results;
    }
}
