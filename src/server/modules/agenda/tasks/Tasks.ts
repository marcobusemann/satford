import { ITask } from './ITask';
import { HttpGetTask } from './HttpGetTask';

export class Tasks {
    private tasks: ITask[] = [];

    constructor() {
        this.tasks.push(new HttpGetTask());
    }

    forEach(callback: (task: ITask) => void) {
        this.tasks.forEach((task: ITask) => {
            callback(task);
        });
    }
}
