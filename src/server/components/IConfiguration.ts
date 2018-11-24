import { ITest } from "../../shared/ITest";
import { IMattermost } from './IMattermost';
import { IMongoDb } from './IMongoDb';

export interface IMattermostConfigurationData {
    url: string;
    username: string;
    channel?: string;
}

export interface IConfigurationData {
    tests: ITest[];
    mattermost?: IMattermostConfigurationData;
}

export interface IConfiguration {
    tests(): Promise<ITest[]>;
    mattermost(): Promise<IMattermost>;
    mongodb(): Promise<IMongoDb>;
}

export class FakeConfiguration implements IConfiguration {
    constructor(
        private _tests: ITest[],
        private _mattermost: IMattermost = null,
        private _mongodb: IMongoDb = null,
    ) {}

    public async tests(): Promise<ITest[]> {
        return this._tests;
    }

    public async mattermost(): Promise<IMattermost> {
        return this._mattermost;
    }

    public async mongodb(): Promise<IMongoDb> {
        return this._mongodb;
    }

    public async;
}
