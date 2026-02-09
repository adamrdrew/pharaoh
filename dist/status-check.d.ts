import type { Logger } from './log.js';
export type StatusCheckResult = {
    ok: true;
    status: string;
} | {
    ok: false;
    error: string;
};
export declare function checkPhaseStatus(cwd: string, pluginPath: string, logger: Logger): Promise<StatusCheckResult>;
//# sourceMappingURL=status-check.d.ts.map