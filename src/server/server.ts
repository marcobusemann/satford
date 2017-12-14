import * as express from 'express';
import { ModuleAgenda, PubSub, ModuleStore, ModuleMattermost } from './modules';
import { ExpressWrapper } from './IExpress';

const pubsub = new PubSub();
const app = express();
const appWrapper = new ExpressWrapper(app);

new ModuleAgenda(appWrapper, pubsub);
new ModuleStore(pubsub);

const MATTERMOST_URL = process.env.MATTERMOST_URL;
const MATTERMOST_USERNAME = process.env.MATTERMOST_USERNAME;
if (MATTERMOST_URL && MATTERMOST_USERNAME)
{
    const mattermostConfig = {
        url: MATTERMOST_URL,
        channel: process.env.MATTERMOST_CHANNEL || '',
        username: MATTERMOST_USERNAME
    };
    console.log('Mattermost activated', mattermostConfig);
    new ModuleMattermost(mattermostConfig, pubsub);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
});