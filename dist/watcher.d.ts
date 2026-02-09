import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { PhaseRunner } from './runner.js';
/**
 * Watches dispatch directory for new markdown files
 */
export declare class DispatchWatcher {
    private readonly fs;
    private readonly logger;
    private readonly status;
    private readonly runner;
    private readonly dispatchPath;
    private readonly pid;
    private readonly started;
    private watcher;
    private busy;
    private queue;
    constructor(fs: Filesystem, logger: Logger, status: StatusManager, runner: PhaseRunner, dispatchPath: string, pid: number, started: string);
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