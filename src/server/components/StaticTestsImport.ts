import { IMessageHub } from "./IMessageHub";
import { IConfiguration } from "./IConfiguration";
import { TEST_CREATED, ITestCreatedData } from "./Messages";

export class StaticTestsImport {
    constructor(
        private configuration: IConfiguration,
        private messageHub: IMessageHub
    ) {}

    public async importTests(): Promise<void> {
        console.log("Importing tests from configuration...");
        const tests = await this.configuration.tests();
        for (const test of tests) {
            this.messageHub.publish<ITestCreatedData>(TEST_CREATED, { test });
        }

        if (tests.length === 0)
            console.log("No tests in configuration provided!");

        console.log("Finished importing tests.");
    }
}
