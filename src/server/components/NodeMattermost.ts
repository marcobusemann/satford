import { IMattermost, IMattermostMessage } from "./IMattermost";
import * as Mattermost from "node-mattermost";

export class NodeMattermost implements IMattermost {
    constructor(
        private channel: string,
        private username: string,
        private url: string
    ) {}

    async send(message: IMattermostMessage): Promise<void> {
        const mattermost = new Mattermost(this.url);

        mattermost.send({
            channel: this.channel,
            username: this.username,
            text: message.text,
            attachments: message.attachments
        });
    }
}
