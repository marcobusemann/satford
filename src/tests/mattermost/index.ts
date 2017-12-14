import { ModuleMattermost } from '../../server/modules/mattermost/ModuleMattermost';
import { PubSub } from '../../server/modules/pubsub/PubSub';
import { ITestResult } from '../../server/modules/domain/ITest';
import { setTimeout } from 'timers';

const pubsub = new PubSub();
const mattermost = new ModuleMattermost({
    url: 'http://mattermost.lavan.office.treesoft.de/hooks/9trcnr83gibou833m61mjjnsqw',
    channel: 'bot-tests',
    username: 'satford'
}, pubsub);

pubsub.publish(PubSub.TOPIC_TESTRESULT_CHANGED, {
    success: true,
    testName: 'Test nummer 1',
    timestamp: new Date()
});

pubsub.publish(PubSub.TOPIC_TESTRESULT_CHANGED, {
    success: false,
    testName: 'Test nummer 2',
    timestamp: new Date()
});
