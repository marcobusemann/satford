import * as express from "express";
import * as morgan from "morgan";

import { AppRouter } from "./router";
import { config } from "./config";

import { PubSubMessageHub } from "./components/PubSubMessageHub";
import { ScheduledTasks } from "./components/ScheduledTasks";
import {
    FileSystemConfiguration,
    IConfiguration
} from "./components/Configuration";
import { StaticTestsImport } from "./components/StaticTestsImport";
import { DebugConfiguration } from "./components/DebugConfiguration";
import { IMongoDb } from "./components/IMongoDb";
import { InMemoryMongoDb } from "./components/InMemoryMongoDb";
import { ExternalMongoDb } from "./components/ExternalMongoDb";
import { PersistedTestResults } from './components/PersistedTestResults';
import { ChangeDetection } from './components/ChangeDetection';

let mongodb: IMongoDb = null;
let configuration: IConfiguration = null;
if (process.env.NODE_ENV === "production") {
    configuration = new FileSystemConfiguration(config.configFile);
    mongodb = new ExternalMongoDb(config.mongodbUrl);
} else {
    configuration = new DebugConfiguration();
    mongodb = new InMemoryMongoDb();
}

const messageHub = new PubSubMessageHub();
const scheduledTasks = new ScheduledTasks(mongodb, messageHub);
const staticTests = new StaticTestsImport(configuration, messageHub);
const persistedTestResults = new PersistedTestResults(mongodb, messageHub);
const changeDetection = new ChangeDetection(messageHub);

const app = express();
app.use(morgan("tiny"));

setTimeout(async () => {
    await scheduledTasks.start();
    await persistedTestResults.start();
    await changeDetection.start();
    staticTests.importTests();

    app.use(AppRouter(scheduledTasks));
    app.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}!`);
    }).on('error', console.log);    
}, 0)
