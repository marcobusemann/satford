import { FakeFileSystem } from "./FileSystem";
import { FileSystemConfiguration } from './FileSystemConfiguration';
import { ITest } from '../../shared/ITest';

describe('file system configuration', () => {

    test('should parse the configuration correctly', async () => {
        const fakeFilesystem = new FakeFileSystem('{ "tests": [ { "isActive": true, "name": "Hans", "type": "http-get", "frequency": "10 minutes", "options": {} } ] }');
        const fileSystemConfiguration = new FileSystemConfiguration('', fakeFilesystem);

        const tests = await fileSystemConfiguration.tests();

        const expectedTests: ITest[] = [
            {
                isActive: true,
                name: "Hans",
                type: "http-get",
                frequency: "10 minutes",
                options: {}
            }
        ];
        expect(tests).toEqual(expectedTests);
    });
});