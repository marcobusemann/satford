import { StaticTestsImport } from "./StaticTestsImport";
import { FakeConfiguration } from "./Configuration";
import { FakeTest } from "../../shared/ITest";
import { TEST_CREATED } from "./Messages";
import { FakeMessageHub } from "./FakeMessageHub";

describe("Static import", () => {
    test("should send a message for each test", async () => {
        const hub = new FakeMessageHub();
        const test = new FakeTest("A");
        const importer = new StaticTestsImport(
            new FakeConfiguration([test]),
            hub
        );
        await importer.importTests();
        expect(hub.messages).toEqual([
            {
                message: TEST_CREATED,
                data: {
                    test
                }
            }
        ]);
    });
});
