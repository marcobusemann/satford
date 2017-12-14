import { Express } from 'express';

export interface IExpress {
    use(endpoint: string, obj: any): void;
}

export class ExpressWrapper implements IExpress {
    constructor(private express: Express) {
    }

    use(endpoint: string, obj: any): void {
        this.express.use(endpoint, obj);
    }
}