import { Server as SocketIOServer } from "socket.io";
import { IMessageHub } from "./IMessageHub";
import { ITest, ITestsAndLastResults } from "../../shared/ITest";
import { ITestCreatedData, TEST_CREATED, ITestFinishedData, SCHEDULED_TEST_FINISHED } from "./Messages";
import { ITestResult } from '../../shared/ITestResult';
import { MongoTestResult } from './MongoTestResult';
import * as moment from 'moment';
import { ITestHistory, TestDayStatistic, ITestDayStatistic } from '../../shared/ITestHistory';

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

            socket.on("DATA_FOR_TEST", async (testName) => {
                const results = await this.gatherResultsForTest(testName);
                const history = await this.generateTestHistory(results);
                socket.emit("RECEIVE_DATA_FOR_TEST", history);
            });
        });
    }

    private async memorizeTest(data: ITestCreatedData) {
        this.tests.push(data.test);
        this.server.emit("TEST_CREATED", data.test);
    }

    private async memorizeTestResult(data: ITestFinishedData) {
        this.lastTestResults[data.test.name] = data.result;
        this.server.emit("TEST_FINISHED", data.result);
    }

    private async gatherResultsForTest(testName: string): Promise<ITestResult[]> {
        const results = await MongoTestResult.find({ name: testName })
            .sort({ timestamp: -1 })
            .limit(200)
            .exec();
        return results;
    }

    private async generateTestHistory(unsortedResults: ITestResult[]): Promise<ITestHistory> {
        const results = unsortedResults.sort((a, b) => {
            const momentA = moment(a.timestamp);
            const momentB = moment(b.timestamp);
            
            if (momentA.isSame(momentB))
                return 0;

            if (momentA.isBefore(momentB))
                return -1;

            return 1;
        });
        
        const history: ITestHistory = {
            results: unsortedResults,
            calendarChart: {},
            dayStatistic: [],
        };

        const dayStatisticCache: { [day: string]: ITestDayStatistic } = {};

        const hasResults = results.length !== 0;
        if (hasResults) {
            const oldest = results[0];
            history.dayStatistic.push(new TestDayStatistic(moment(oldest.timestamp).subtract(1, 'day')));
        }

        for (const result of results) {
            const date = moment(result.timestamp).format("YYYY-MM-DD");

            if (!history.calendarChart[date])
                history.calendarChart[date] = result.success ? 1 : 2;

            if (!dayStatisticCache[date]) {
                const dayStatistic = new TestDayStatistic(moment(result.timestamp));
                dayStatisticCache[date] = dayStatistic;
                history.dayStatistic.push(dayStatistic);
            }

            if (result.success)
                dayStatisticCache[date].successful++;
            else
                dayStatisticCache[date].failed++;
        }

        if (hasResults) {
            const newest = results[results.length - 1];
            history.dayStatistic.push(new TestDayStatistic(moment(newest.timestamp).add(1, 'day')));
        }

        return history;
    }
}
