import { ITest } from "../../shared/ITest";

export interface IConfigurationData {
    tests: ITest[];
}

export interface IConfiguration {
    tests(): Promise<ITest[]>;
}

export class FakeConfiguration implements IConfiguration {
    constructor(private _tests: ITest[]) {}

    public async tests(): Promise<ITest[]> {
        return this._tests;
    }
}
