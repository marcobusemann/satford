import * as express from "express";
import * as morgan from "morgan";
import { Server as HttpServer } from "http";
import * as socketIo from "socket.io";
import * as mongoose from "mongoose";

import { AppRouter } from "./router";
import { config } from "./config";

import { PubSubMessageHub } from "./components/PubSubMessageHub";
import { ScheduledTasks } from "./components/ScheduledTasks";
import { IConfiguration } from "./components/IConfiguration";
import { StaticTestsImport } from "./components/StaticTestsImport";
import { DebugConfiguration } from "./components/DebugConfiguration";
import { PersistedTestResults } from "./components/PersistedTestResults";
import { ChangeDetection } from "./components/ChangeDetection";
import { FileSystemConfiguration } from "./components/FileSystemConfiguration";
import { MattermostNotifications } from "./components/MattermostNotifications";
import { ClientButtler } from './components/ClientButtler';

let configuration: IConfiguration = null;
if (process.env.NODE_ENV === "production") {
    console.log("Using production environment.", config);
    configuration = new FileSystemConfiguration(
        config.configFile,
        config.mongodbUrl
    );
} else {
    console.log("Using debug environment.");
    configuration = new DebugConfiguration();
}

const messageHub = new PubSubMessageHub();
const scheduledTasks = new ScheduledTasks(configuration, messageHub);
const staticTests = new StaticTestsImport(configuration, messageHub);
const persistedTestResults = new PersistedTestResults(
    configuration,
    messageHub
);
const changeDetection = new ChangeDetection(messageHub);
const mattermostNotifications = new MattermostNotifications(
    configuration,
    messageHub
);

const app = express();
const httpServer = new HttpServer(app);
const io = socketIo(httpServer);

const clientButtler = new ClientButtler(io, messageHub);

app.use(morgan("tiny"));

setTimeout(async () => {
    const mongoDb = await configuration.mongodb();
    const runningMongoDb = await mongoDb.running();
    await connectWithRetry(runningMongoDb.url);

    await scheduledTasks.start();
    await persistedTestResults.start();
    await changeDetection.start();
    await mattermostNotifications.start();
    await clientButtler.start();
    await staticTests.importTests();

    app.use(AppRouter(scheduledTasks));
    httpServer.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}!`);
    }).on("error", console.log);
}, 0);

async function connectWithRetry(url) {
    return new Promise<void>((resolve, reject) => {
        mongoose.connect(
            url,
            (error) => {
                if (error) {
                    console.error(
                        "Failed to connect to mongo on startup - retrying in 2 sec"
                    );
                    setTimeout(() => {
                        connectWithRetry(url)
                            .catch(reject)
                            .then(resolve);
                    }, 2000);
                }
                else
                    resolve();
            }
        );        
    });
}