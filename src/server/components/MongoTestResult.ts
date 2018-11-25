import { ITestResult } from "../../shared/ITestResult";
import * as mongoose from "mongoose";

interface ITestResultModel extends ITestResult, mongoose.Document {}
export const MongoTestResult = mongoose.model<ITestResultModel>("TestResult", new mongoose.Schema({
    success: Boolean,
    name: String,
    timestamp: Date,
    data: Object
}));