import { FileSystem } from './FileSystem';
import * as fs from "fs";

export class NodeFileSystem implements FileSystem {
    readFile(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(
                path,
                {
                    encoding: "utf-8"
                },
                (error, data) => {
                    if (error) return reject(error);
                    resolve(data);
                }
            );
        });
    }
}