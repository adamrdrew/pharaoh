import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { Filesystem } from './status.js';
export declare function verifyPhaseCompletion(sdkResult: PhaseResult, phaseName: string, cwd: string, filesystem: Filesystem, logger: Logger): Promise<PhaseResult>;
//# sourceMappingURL=runner-verification.d.ts.map