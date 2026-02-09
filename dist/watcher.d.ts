import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { PhaseRunner } from './runner.js';
import type { GitOperations } from './git.js';
export interface DispatchWatcherOptions {
    readonly dispatchPath: string;
    readonly pid: number;
    readonly started: string;
}
export interface DispatchWatcherDeps {
    readonly fs: Filesystem;
    readonly logger: Logger;
    readonly status: StatusManager;
    readonly runner: PhaseRunner;
    readonly git: GitOperations;
}
export declare class DispatchWatcher {
    private readonly deps;
    private readonly options;
    private watcher;
    private busy;
    private queue;
    constructor(deps: DispatchWatcherDeps, options: DispatchWatcherOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleDispatchFile;
    private enqueueFile;
    private processQueue;
    private processNextInQueue;
    private processDispatchFile;
    private executeDispatchFile;
    private validateDispatchFile;
    private runAndReportPhase;
    private buildContext;
}
//# sourceMappingURL=watcher.d.ts.map