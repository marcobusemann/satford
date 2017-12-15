import { Express, Request, Response } from 'express';

export interface IExpress {
    use(endpoint: string, callback: (request: Request, response: Response) => void);
}

export class ExpressWrapper implements IExpress {
    constructor(private express: Express) {
    }

    use(endpoint: string, callback: (request: Request, response: Response) => void) {
        this.express.use(endpoint, callback);
    }
}