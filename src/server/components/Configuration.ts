import { ITest } from "../../shared/ITest";
import * as fs from "fs";

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

export class FileSystemConfiguration implements IConfiguration {
    constructor(private path: string) {}

    public tests(): Promise<ITest[]> {
        return new Promise<ITest[]>((resolve, reject) => {
            fs.readFile(
                this.path,
                {
                    encoding: "utf-8"
                },
                (error, rawData) => {
                    if (error) return reject(error);

                    const data = JSON.parse(rawData) as IConfigurationData;
                    resolve(data.tests);
                }
            );
        });
    }
}
