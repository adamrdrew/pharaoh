import type { ServiceStatus } from './types.js';
import { type ReadResult } from './status-reader.js';
import type { SetIdleInput, SetBusyInput, SetDoneInput, SetBlockedInput } from './status-inputs.js';
export interface FilesystemStats {
    isDirectory(): boolean;
    mtimeMs: number;
}
export interface Filesystem {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    appendFile(path: string, content: string): Promise<void>;
    mkdir(path: string, options?: {
        recursive: boolean;
    }): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    readdir(path: string): Promise<string[]>;
    stat(path: string): Promise<FilesystemStats>;
    openExclusive(path: string, content: string): Promise<void>;
}
export type { ReadResult };
export type { SetIdleInput, SetBusyInput, SetDoneInput, SetBlockedInput, } from './status-inputs.js';
/**
 * Manages pharaoh.json with atomic writes and state transitions
 */
export declare class StatusManager {
    private readonly fs;
    private readonly statusPath;
    constructor(fs: Filesystem, statusPath: string);
    write(status: ServiceStatus): Promise<void>;
    read(): Promise<ReadResult>;
    remove(): Promise<void>;
    setIdle(input: SetIdleInput): Promise<void>;
    setBusy(input: SetBusyInput): Promise<void>;
    setDone(input: SetDoneInput): Promise<void>;
    setBlocked(input: SetBlockedInput): Promise<void>;
}
//# sourceMappingURL=status.d.ts.map