import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
export declare function buildSuccessResult(logger: Logger, phaseName: string, turns: number, costUsd: number, durationMs: number): Promise<PhaseResult>;
export declare function buildFailureResult(logger: Logger, phaseName: string, subtype: string, errors: string, turns: number, costUsd: number, durationMs: number): Promise<PhaseResult>;
export declare function buildNoResultError(logger: Logger, phaseName: string, costUsd: number, turns: number, durationMs: number): Promise<PhaseResult>;
//# sourceMappingURL=runner-results.d.ts.map