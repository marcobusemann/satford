import * as express from 'express';
import { ModuleAgenda, PubSub, ModuleStore, ModuleMattermost } from './modules';
import { ExpressWrapper } from './IExpress';
import { IConfiguration } from './modules/domain/IConfiguration';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync(process.env.CONFIG_FILE, 'utf-8')) as IConfiguration;

const pubsub = new PubSub();
const app = express();
const appWrapper = new ExpressWrapper(app);

new ModuleAgenda({
    mongoDbUrl: process.env.MONGODB_URL,
    tests: config.tests
}, appWrapper, pubsub);
new ModuleStore({
    mongoDbUrl: process.env.MONGODB_URL
}, appWrapper, pubsub);

if (config.mattermost)
    new ModuleMattermost(config.mattermost, pubsub);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
});