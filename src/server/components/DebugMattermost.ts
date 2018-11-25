import { IMattermost, IMattermostMessage } from './IMattermost';

export class DebugMattermost implements IMattermost {
    async send(message: IMattermostMessage): Promise<void> {
        console.log(`Message to mattermost:`, message);
    }
}