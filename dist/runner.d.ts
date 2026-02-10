import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager, Filesystem } from './status.js';
import type { EventWriter } from './event-writer.js';
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
    private readonly pluginPath;
    private readonly progressDebouncer;
    private readonly statusThrottler;
    constructor(logger: Logger, status: StatusManager, config: RunnerConfig, eventWriter: EventWriter, filesystem: Filesystem);
    runPhase(pid: number, started: string, phasePrompt: string, phaseName?: string): Promise<PhaseResult>;
    private initializePhase;
    private processQueryMessages;
    private processMessage;
    private updateStatusIfNeeded;
    private updateStatusWithMetrics;
}
//# sourceMappingURL=runner.d.ts.map