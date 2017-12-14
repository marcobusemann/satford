import { Express } from 'express';
import { PubSub } from '../pubsub/PubSub';
import { ITestResult } from '../domain/ITest';

import * as Mattermost from 'node-mattermost';

export interface IMattermostConfiguration {
    url: string;
    channel: string;
    username: string;
}

export class ModuleMattermost {
    private mattermost: any;

    constructor(private config: IMattermostConfiguration, private pubsub: PubSub) {
        this.mattermost = new Mattermost(this.config.url);

        pubsub.subscribe(PubSub.TOPIC_TESTRESULT_CHANGED, (message: string, data: any) => {
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
            //icon_url: 'http://www.foo.com/image.png',
            //icon_emoji: 'taco',
            //attachments: attachment_array,
            //unfurl_links: true,
            //link_names: 1
        });
    }
}