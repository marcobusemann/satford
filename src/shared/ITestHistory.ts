import { ITestResult } from "./ITestResult";
import * as moment from "moment";

export interface ITestCalendarChart {
    [day: string]: number;
}

export interface ITestDayStatistic {
    day: string;
    successful: number;
    failed: number;
}

export class TestDayStatistic implements ITestDayStatistic {
    day: string;

    constructor(
        day: moment.Moment,
        public successful: number = 0,
        public failed: number = 0
    ) {
        this.day = day.format("YYYY-MM-DD");
    }
}

export interface ITestHistory {
    results: ITestResult[];
    calendarChart: ITestCalendarChart;
    dayStatistic: ITestDayStatistic[];
}

export class MovingTestHistory {
    constructor(private history: ITestHistory) {}

    move(newResult: ITestResult): ITestHistory {
        const clonedHistory: ITestHistory = {
            results: [newResult].concat(this.history.results),
            calendarChart: Object.assign({}, this.history.calendarChart),
            dayStatistic: [].concat(this.history.dayStatistic)
        };

        const date = moment(newResult.timestamp).format("YYYY-MM-DD");
        clonedHistory.calendarChart[date] = newResult.success ? 1 : 2;

        const day = this.history.dayStatistic[
            this.history.dayStatistic.length - 2
        ];
        if (newResult.success) day.successful++;
        else day.failed++;

        return clonedHistory;
    }
}
