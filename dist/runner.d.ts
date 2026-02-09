import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
/**
 * Configuration for phase execution
 */
export interface RunnerConfig {
    readonly cwd: string;
    readonly pluginPath: string;
    readonly model: string;
}
/**
 * Executes phases via the Claude Agent SDK
 */
export declare class PhaseRunner {
    private readonly logger;
    private readonly status;
    private readonly config;
    constructor(logger: Logger, status: StatusManager, config: RunnerConfig);
    runPhase(pid: number, started: string, phasePrompt: string, phaseName?: string): Promise<PhaseResult>;
    private initializePhase;
    private processQueryMessages;
    private processMessage;
    private updateState;
    private handleMessage;
    private handleNonResultMessage;
}
//# sourceMappingURL=runner.d.ts.map