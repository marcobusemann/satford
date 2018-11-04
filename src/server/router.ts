import { Router, static as serveStatic } from 'express';

import { ClientController } from './controllers/ClientController';

export const AppRouter = (): Router => {
    const router: Router = Router();

    router.use(ClientController());

    return router;
};
