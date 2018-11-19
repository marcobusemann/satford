export interface ITest {
    isActive: boolean;
    name: string;
    type: string;
    frequency: string;
    allowedFails?: number;
    options: any;
}

export class FakeTest implements ITest {
    isActive: boolean;
    type: string;
    frequency: string;
    allowedFails?: number;
    options: any;

    constructor(public name: string) {}
}
