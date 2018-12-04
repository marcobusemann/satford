import { Server as SocketIOServer } from "socket.io";
import { IMessageHub } from "./IMessageHub";
import { ITest, ITestsAndLastResults } from "../../shared/ITest";
import { ITestCreatedData, TEST_CREATED, ITestFinishedData, SCHEDULED_TEST_FINISHED } from "./Messages";
import { ITestResult } from '../../shared/ITestResult';
import { MongoTestResult } from './MongoTestResult';
import * as moment from 'moment';

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
                const chartData = await this.calculateInitialChartData(results);
                socket.emit("RECEIVE_DATA_FOR_TEST", {
                    results,
                    charts: chartData,
                });
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

    private async calculateInitialChartData(results: ITestResult[]) {
        let calendarChartData = {};
        let chartDataMap = {};
        let chartData = [];

        const sortedResults = results.sort((a, b) => {
            const momentA = moment(a.timestamp);
            const momentB = moment(b.timestamp);
            
            if (momentA.isSame(momentB))
                return 0;

            if (momentA.isBefore(momentB))
                return -1;

            return 1;
        });

        if (sortedResults.length !== 0) {
            const latest = sortedResults[0];
            chartData.push({
                date: moment(latest.timestamp).subtract(1, 'day').format("YYYY-MM-DD"),
                success: 0,
                failed: 0,
            });
        }

        sortedResults.forEach(result => {
            const date = moment(result.timestamp).format("YYYY-MM-DD");
            if (!calendarChartData[date]) {
                const index = result.success ? 1 : 2;
                calendarChartData[date] = index;
            }

            if (!chartDataMap[date]) {
                const dayData = {
                    date: date,
                    success: 0,
                    failed: 0,
                };
                chartDataMap[date] = dayData;
                chartData.push(dayData);
            }

            if (result.success)
                chartDataMap[date].success++;
            else
                chartDataMap[date].failed++;
        });

        if (sortedResults.length !== 0) {
            const last = sortedResults[sortedResults.length - 1];
            chartData.push({
                date: moment(last.timestamp).add(1, 'day').format("YYYY-MM-DD"),
                success: 0,
                failed: 0,
            })
        }

        return {
            calendar: calendarChartData,
            area: chartData,
        }
    }
}
