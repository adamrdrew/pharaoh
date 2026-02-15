import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager, Filesystem } from './status.js';
import type { EventWriter } from './event-writer.js';
import type { LockManager } from './lock-manager.js';
/**
 * Configuration for phase execution
 */
export interface RunnerConfig {
    readonly cwd: string;
    readonly model: string;
}
/**
 * Executes phases via the Claude Agent SDK
 */
export declare class PhaseRunner {
    private readonly logger;
    private readonly status;
    private readonly config;
    private readonly eventWriter;
    private readonly filesystem;
    private readonly lock;
    private readonly pluginPath;
    private readonly progressDebouncer;
    private readonly statusThrottler;
    constructor(logger: Logger, status: StatusManager, config: RunnerConfig, eventWriter: EventWriter, filesystem: Filesystem, lock: LockManager);
    runPhase(pid: number, started: string, phasePrompt: string, phaseName: string | undefined, gitBranch: string | null, metadata: {
        pharaohVersion: string;
        ushabtiVersion: string;
        model: string;
        cwd: string;
    }, phasesCompleted: number): Promise<PhaseResult>;
    private initializePhase;
    private processQueryMessages;
    private processMessage;
    private validateLockPeriodically;
    private buildLockFailureResult;
    private updateStatusIfNeeded;
    private updateStatusWithMetrics;
}
//# sourceMappingURL=runner.d.ts.map