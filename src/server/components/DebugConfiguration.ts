import { IConfiguration, IMattermostConfigurationData } from "./IConfiguration";
import { ITest } from "../../shared/ITest";
import { IMattermost } from './IMattermost';
import { DebugMattermost } from './DebugMattermost';
import { InMemoryMongoDb } from './InMemoryMongoDb';
import { IMongoDb } from './IMongoDb';

export class DebugConfiguration implements IConfiguration {
    async tests(): Promise<ITest[]> {
        return [
            {
                name: "google.de",
                frequency: "30 seconds",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "http://google.de",
                    expectedStatusCode: 200
                }
            },
            {
                name: "localhost demo service",
                frequency: "30 seconds",
                isActive: true,
                type: "http-get",
                options: {
                    endpoint: "http://localhost:4000",
                    expectedStatusCode: 200
                }
            }
        ];
    }

    async mattermost(): Promise<IMattermost> {
        return new DebugMattermost();
    }

    public async mongodb(): Promise<IMongoDb> {
        return new InMemoryMongoDb();
    }
}
