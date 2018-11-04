import * as path from 'path';
import { Router, static as serveStatic } from 'express';

export const ClientController = (): Router => {
    const router: Router = Router();

    const publicPath = path.resolve('public');
    router.use("/public", serveStatic(publicPath));
    router.get("*", (req, res) => {
        res.sendFile(path.join(publicPath, "index.html"));
    });

    return router;
};
