import * as express from "express";
import * as morgan from "morgan";
import { Server as HttpServer } from "http";
import * as socketIo from "socket.io";

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

let configuration: IConfiguration = null;
if (process.env.NODE_ENV === "production") {
    configuration = new FileSystemConfiguration(
        config.configFile,
        config.mongodbUrl
    );
} else {
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

io.on("connection", function(socket) {
    console.log("a user connected");
});

app.use(morgan("tiny"));

setTimeout(async () => {
    await scheduledTasks.start();
    await persistedTestResults.start();
    await changeDetection.start();
    await mattermostNotifications.start();
    staticTests.importTests();

    app.use(AppRouter(scheduledTasks));
    httpServer.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}!`);
    }).on("error", console.log);
}, 0);
