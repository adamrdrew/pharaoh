import type { Logger } from './log.js';
import type { GitOperations } from './git.js';
import type { Filesystem } from './status.js';
export declare function finalizeGreenPhase(git: GitOperations, logger: Logger, phaseName: string, fs: Filesystem, cwd: string): Promise<string | null>;
//# sourceMappingURL=git-post-phase.d.ts.map