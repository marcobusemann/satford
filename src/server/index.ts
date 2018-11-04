import * as express from 'express';
import * as morgan from 'morgan';

import { AppRouter } from './router';
import { config } from './config';

const app = express();
app.use(morgan('tiny'));
app.use(AppRouter());

app.listen(config.port, () => {
   console.log(`Server listening on port ${config.port}!`);
});