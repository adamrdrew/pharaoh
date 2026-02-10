import type { Logger } from './log.js';
import type { Filesystem } from './status.js';
export type StatusCheckResult = {
    ok: true;
    status: string;
} | {
    ok: false;
    error: string;
};
export declare function checkPhaseStatus(cwd: string, fs: Filesystem, logger: Logger): Promise<StatusCheckResult>;
//# sourceMappingURL=status-check.d.ts.map