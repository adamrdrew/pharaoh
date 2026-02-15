import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { PhaseRunner } from './runner.js';
import type { GitOperations } from './git.js';
import type { ServerMetadata } from './server-deps.js';
import type { LockManager } from './lock-manager.js';
export interface DispatchWatcherOptions {
    readonly dispatchPath: string;
    readonly pid: number;
    readonly started: string;
    readonly metadata: ServerMetadata;
}
export interface DispatchWatcherDeps {
    readonly fs: Filesystem;
    readonly logger: Logger;
    readonly status: StatusManager;
    readonly runner: PhaseRunner;
    readonly git: GitOperations;
    readonly lock: LockManager;
}
export declare class DispatchWatcher {
    private readonly deps;
    private readonly options;
    private watcher;
    private busy;
    private queue;
    private phasesCompleted;
    constructor(deps: DispatchWatcherDeps, options: DispatchWatcherOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleDispatchFile;
    private enqueueFile;
    private processQueue;
    private processNextInQueue;
    private processDispatchFile;
    private validateLockOwnership;
    private abortDispatch;
    private buildIdleInput;
    private executeDispatchFile;
    private validateDispatchFile;
    private runAndReportPhase;
    private buildContext;
}
//# sourceMappingURL=watcher.d.ts.map