import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';
export declare function releaseLock(fs: Filesystem, lockPath: string, current?: LockInfo): Promise<void>;
//# sourceMappingURL=lock-release.d.ts.map