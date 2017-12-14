import { ITest } from './ITest';
import { IMattermostConfiguration } from '../mattermost/ModuleMattermost';

export interface IConfiguration {
    tests: ITest[];
    mattermost?: IMattermostConfiguration;
}