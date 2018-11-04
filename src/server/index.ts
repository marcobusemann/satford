import * as express from 'express';
import * as morgan from 'morgan';

import { AppRouter } from './router';
import { config } from './config';

import { PubSubMessageHub } from './components/PubSubMessageHub';
import { ScheduledTasks } from './components/ScheduledTasks';

const messageHub = new PubSubMessageHub();
const scheduledTasks = new ScheduledTasks(config.mongodbUrl, messageHub);

const app = express();
app.use(morgan('tiny'));
app.use(AppRouter(scheduledTasks));

app.listen(config.port, () => {
   console.log(`Server listening on port ${config.port}!`);
});