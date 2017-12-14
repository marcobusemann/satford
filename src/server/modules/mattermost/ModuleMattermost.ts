import { Express } from 'express';
import { IMessageHub, TOPIC_TESTRESULT_CHANGED } from '../../IMessageHub';
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

        pubsub.subscribe(TOPIC_TESTRESULT_CHANGED, (message: string, data: any) => {
            console.log('Sending message to mattermost...', data);
            this.sendMessage(data as ITestResult);
        });
    }

    sendMessage(testResult: ITestResult): void {
        const text = `Test **${testResult.testName}** ${testResult.success ? 'is working again!' : 'failed!'}`;

        this.mattermost.send({
            text: ' ',
            channel: this.config.channel,
            username: this.config.username,
            attachments: [{
                text,
                color: testResult.success ? '#00ff00' : '#ff0000'
            }]
        });
    }
}