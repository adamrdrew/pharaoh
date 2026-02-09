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
    /**
     * Start watching dispatch directory
     */
    start(): Promise<void>;
    /**
     * Stop watching and clean up resources
     */
    stop(): Promise<void>;
    /**
     * Handle a new dispatch file
     */
    private handleDispatchFile;
    /**
     * Process queued dispatch files
     */
    private processQueue;
    /**
     * Process a single dispatch file
     */
    private processDispatchFile;
}
//# sourceMappingURL=watcher.d.ts.map