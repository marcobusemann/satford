import { IMessageHub } from "./IMessageHub";
import { ITestStateChangedData, TEST_STATE_CHANGED } from "./Messages";
import { IMattermost } from "./IMattermost";
import { IConfiguration } from "./IConfiguration";

export class MattermostNotifications {
    private mattermost: IMattermost;

    constructor(
        private configuration: IConfiguration,
        private messageHub: IMessageHub
    ) {}

    public async start() {
        this.mattermost = await this.configuration.mattermost();
        this.messageHub.subscribe<ITestStateChangedData>(
            TEST_STATE_CHANGED,
            (message, data) => this.sendMessage(data)
        );
    }

    private async sendMessage(data: ITestStateChangedData) {
        console.log(`Sending message to mattermost for ${data.test.name}`);

        const text = `**${data.test.name}** ${
            data.result.success ? "is working again!" : "failed!"
        }`;

        this.mattermost.send({
            text: " ",
            attachments: [
                {
                    text,
                    color: data.result.success ? "#00ff00" : "#ff0000",
                    fields: [
                        {
                            short: true,
                            title: "Options",
                            value: JSON.stringify(data.test.options)
                        },
                        {
                            short: true,
                            title: "Type",
                            value: data.test.type
                        }
                    ]
                }
            ]
        });
    }
}
