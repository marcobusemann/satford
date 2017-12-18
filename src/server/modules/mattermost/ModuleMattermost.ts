import { Express } from 'express';
import { IMessageHub, TOPIC_TESTRESULT_CHANGED, ITestResultChangedData } from '../../IMessageHub';
import { ITestResult } from '../domain/ITest';

import * as Mattermost from 'node-mattermost';

export interface IMattermostConfiguration {
    url: string;
    username: string;
    channel?: string;
}

export class ModuleMattermost {
    private mattermost: any;

    constructor(private config: IMattermostConfiguration, private pubsub: IMessageHub) {
        this.mattermost = new Mattermost(this.config.url);

        pubsub.subscribe<ITestResultChangedData>(TOPIC_TESTRESULT_CHANGED, (message, data) => {
            this.sendMessage(data);
        });
    }

    sendMessage(data: ITestResultChangedData): void {
        console.log(`Sending message to mattermost for ${data.test.name}`);
        
        const text = `**${data.test.name}** ${data.result.success ? 'is working again!' : 'failed!'}`;

        this.mattermost.send({
            text: ' ',
            channel: this.config.channel,
            username: this.config.username,
            attachments: [{
                text,
                color: data.result.success ? '#00ff00' : '#ff0000',
                fields: [
                    {
                        short: true,
                        title: 'Target',
                        value: data.test.endpoint
                    },
                    {
                        short: true,
                        title: 'Type',
                        value: data.test.type
                    }
                ]
            }]
        });
    }
}