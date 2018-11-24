import { IConfiguration, IConfigurationData } from './Configuration';
import { ITest } from '../../shared/ITest';
import { FileSystem } from './FileSystem';
import { NodeFileSystem } from './NodeFileSystem';

export class FileSystemConfiguration implements IConfiguration {
    constructor(private path: string, private fileSystem: FileSystem = new NodeFileSystem()) {}

    public async tests(): Promise<ITest[]> {
        const fileContent = await this.fileSystem.readFile(this.path);
        const configuration = JSON.parse(fileContent) as IConfigurationData;
        return configuration.tests;
    }
}
