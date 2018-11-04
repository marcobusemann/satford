import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';

const app = express();
app.use(morgan('tiny'));

//app.use('/api', api(clock));

const publicPath = path.resolve('public');
app.use("/public", express.static(publicPath));
app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

const port = 3000;
app.listen(port, () => {
   console.log(`Server listening on port ${port}!`);
});