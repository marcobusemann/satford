import * as agendash from 'agendash';
import { Router } from 'express';
import { ScheduledTasks } from '../components/ScheduledTasks';

export const ScheduledTasksController = (tasks: ScheduledTasks): Router => {
    const router: Router = Router();

    router.use('/agenda', agendash(tasks.agenda));

    return router;
};
