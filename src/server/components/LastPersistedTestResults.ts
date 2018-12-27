import { ILastTestResults } from './ILastTestResults';
import { ITestResult } from '../../shared/ITestResult';
import { MongoTestResult } from './MongoTestResult';

export class LastPersistedTestResults implements ILastTestResults {
    async last(testName: string, amount: number): Promise<ITestResult[]> {
        const models = await MongoTestResult.find({ name: testName })
            .sort({ timestamp: -1 })
            .limit(amount);
        return models as ITestResult[];
    }
}