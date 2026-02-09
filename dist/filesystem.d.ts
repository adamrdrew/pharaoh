import type { Filesystem } from './status.js';
/**
 * Real filesystem implementation using Node's fs promises API
 */
export declare class RealFilesystem implements Filesystem {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    appendFile(path: string, content: string): Promise<void>;
    mkdir(path: string, options?: {
        recursive: boolean;
    }): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
}
//# sourceMappingURL=filesystem.d.ts.map