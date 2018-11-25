export interface FileSystem {
    readFile(path: String): Promise<string>;
}

export class FakeFileSystem implements FileSystem {
    constructor(private result: string) {
    }

    async readFile(path: String): Promise<string> {
        return this.result;
    }
}