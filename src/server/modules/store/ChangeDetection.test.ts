import { ChangeDetection } from './ChangeDetection';
import { ITest, ITestResult } from '../domain/ITest';

const createTestResult = (success: boolean): ITestResult {
    return {
        data: null,
        success: success,
        testName: null,
        timestamp: null
    }
};

const success = createTestResult(true);
const error = createTestResult(false);

describe('change detection', () => {

    test('should not detect a change if there is no result', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeFalsy();
    });

    test('should detect a change if there is only one result that has been failed', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ error ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeTruthy();
    });

    test('should not detect a change if there is only one result that has been successfully', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ success ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeFalsy();
    });

    test('should not detect a change if no fail is allowed and the last two results are successfull', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ success, success ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeFalsy();
    });

    test('should detect a change if no fail is allowed and the last two results are [error, success]', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ error, success ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeTruthy();
    });

    test('should detect a change if no fail is allowed and the last two results are [success, error]', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ success, error ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeTruthy();
    });

    test('should not detect a change if no fail is allowed and the last two results are errors', () => {
        const changeDetection = new ChangeDetection(0);
        const testResults: ITestResult[] = [ error, error ];

        const result = changeDetection.hasStateChanged(testResults);

        expect(result).toBeFalsy();
    });

    class TestData {
        constructor(public expectation: boolean, public results: ITestResult[]) {}
    }

    test('should return the correct result for 1 allowed fail', () => {
        const changeDetection = new ChangeDetection(1);
        const testsData = [
            new TestData(true , [success, error  , error]),
            new TestData(false, [success, success, error]),
            new TestData(false, [success, success, success]),
            new TestData(false, [success, error  , success]),
            new TestData(false, [error  , success, error]),
            new TestData(true , [error  , error  , success]),
            new TestData(false, [error  , success, success]),
            new TestData(false, [success, success, success]),
            new TestData(false, [error  , error  , error]),
        ];

        testsData.forEach(testData => {
            const result = changeDetection.hasStateChanged(testData.results);
            expect(result).toEqual(testData.expectation);
        });
    });

    test('should return the correct result for 2 allowed fail', () => {
        const changeDetection = new ChangeDetection(2);
        const testsData = [
            new TestData(false, [success, success, success, success]),
            new TestData(false, [success, success, success, error]),
            new TestData(false, [success, success, error  , success]),
            new TestData(false, [success, success, error  , error]),
            new TestData(false, [success, error  , success, success]),
            new TestData(false, [success, error  , success, error]),
            new TestData(false, [success, error  , error  , success]),
            new TestData(true , [success, error  , error  , error]),
            new TestData(false, [error  , success, success, success]),
            new TestData(false, [error  , success, success, error]),
            new TestData(false, [error  , success, error  , success]),
            new TestData(false, [error  , success, error  , error]),
            new TestData(false, [error  , error  , success, success]),
            new TestData(false, [error  , error  , success, error]),
            new TestData(true , [error  , error  , error  , success]),
            new TestData(false, [error  , error  , error  , error]),
        ];

        testsData.forEach(testData => {
            const result = changeDetection.hasStateChanged(testData.results);
            expect(result).toEqual(testData.expectation);
        });
    });
});