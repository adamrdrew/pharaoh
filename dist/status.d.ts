import type { ServiceStatus } from './types.js';
/**
 * Filesystem interface for dependency injection.
 * Abstracts file operations for testing.
 */
export interface Filesystem {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    unlink(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
}
/**
 * Result type for status read operations
 */
export type ReadResult = {
    readonly ok: true;
    readonly status: ServiceStatus;
} | {
    readonly ok: false;
    readonly error: string;
};
/**
 * Manages service.json with atomic writes and state transitions
 */
export declare class StatusManager {
    private readonly fs;
    private readonly statusPath;
    constructor(fs: Filesystem, statusPath: string);
    /**
     * Atomically write status to service.json
     */
    write(status: ServiceStatus): Promise<void>;
    /**
     * Read current status from service.json
     */
    read(): Promise<ReadResult>;
    /**
     * Remove service.json (used during shutdown)
     */
    remove(): Promise<void>;
    /**
     * Set status to idle
     */
    setIdle(pid: number, started: string): Promise<void>;
    /**
     * Set status to busy
     */
    setBusy(pid: number, started: string, phase: string, phaseStarted: string): Promise<void>;
    /**
     * Set status to done
     */
    setDone(pid: number, started: string, phase: string, phaseStarted: string, phaseCompleted: string, costUsd: number, turns: number): Promise<void>;
    /**
     * Set status to blocked
     */
    setBlocked(pid: number, started: string, phase: string, phaseStarted: string, phaseCompleted: string, error: string, costUsd: number, turns: number): Promise<void>;
}
//# sourceMappingURL=status.d.ts.map