import {
    IConfiguration,
    IConfigurationData,
} from "./IConfiguration";
import { ITest } from "../../shared/ITest";
import { FileSystem } from "./FileSystem";
import { NodeFileSystem } from "./NodeFileSystem";
import { IMattermost } from "./IMattermost";
import { NodeMattermost } from "./NodeMattermost";
import { IMongoDb } from "./IMongoDb";
import { ExternalMongoDb } from "./ExternalMongoDb";

export class FileSystemConfiguration implements IConfiguration {
    constructor(
        private path: string,
        private mongodbUrl: string,
        private fileSystem: FileSystem = new NodeFileSystem()
    ) {}

    public async tests(): Promise<ITest[]> {
        const configuration = await this.configuration();
        return configuration.tests;
    }

    public async mattermost(): Promise<IMattermost> {
        const configuration = await this.configuration();
        const mattermostConfig = configuration.mattermost;
        return new NodeMattermost(
            mattermostConfig.channel,
            mattermostConfig.username,
            mattermostConfig.url
        );
    }

    public async mongodb(): Promise<IMongoDb> {
        return new ExternalMongoDb(this.mongodbUrl);
    }

    private async configuration(): Promise<IConfigurationData> {
        const fileContent = await this.fileSystem.readFile(this.path);
        const configuration = JSON.parse(fileContent) as IConfigurationData;
        return configuration;
    }
}
