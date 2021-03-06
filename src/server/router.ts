import { Router } from "express";

import { ClientController } from "./controllers/ClientController";
import { ScheduledTasksController } from "./controllers/ScheduledTasksController";
import { ScheduledTasks } from "./components/ScheduledTasks";

export const AppRouter = (scheduledTasks: ScheduledTasks): Router => {
    const router: Router = Router();

    router.use(ScheduledTasksController(scheduledTasks));
    router.use(ClientController());

    return router;
};
