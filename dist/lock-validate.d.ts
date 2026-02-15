import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';
export declare function validateLock(fs: Filesystem, lockPath: string, current?: LockInfo): Promise<boolean>;
export declare function matchesCurrentLock(stored: LockInfo, current: LockInfo): boolean;
//# sourceMappingURL=lock-validate.d.ts.map