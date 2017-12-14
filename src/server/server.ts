import * as express from 'express';
import { ModuleAgenda, PubSub, ModuleStore, ModuleMattermost } from './modules';
import { ExpressWrapper } from './IExpress';
import { ITest } from './modules/domain/ITest';
import { readFileSync } from 'fs';

const pubsub = new PubSub();
const app = express();
const appWrapper = new ExpressWrapper(app);

new ModuleAgenda({
    mongoDbUrl: process.env.MONGODB_URL,
    tests: JSON.parse(readFileSync(process.env.CONFIG_FILE, 'utf-8')) as ITest[]
}, appWrapper, pubsub);
new ModuleStore({
    mongoDbUrl: process.env.MONGODB_URL
}, pubsub);

const MATTERMOST_URL = process.env.MATTERMOST_URL;
const MATTERMOST_USERNAME = process.env.MATTERMOST_USERNAME;
if (MATTERMOST_URL && MATTERMOST_USERNAME)
{
    const mattermostConfig = {
        url: MATTERMOST_URL,
        channel: process.env.MATTERMOST_CHANNEL || '',
        username: MATTERMOST_USERNAME
    };
    new ModuleMattermost(mattermostConfig, pubsub);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
});