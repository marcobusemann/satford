import { IConfiguration } from "./Configuration";
import { ITest } from "../../shared/ITest";

export class DebugConfiguration implements IConfiguration {
    constructor() {}

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
}
