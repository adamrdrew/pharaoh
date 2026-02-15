import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';
export declare function writeLockFileExclusive(fs: Filesystem, lockPath: string, lock: LockInfo): Promise<void>;
export declare function writeLockFile(fs: Filesystem, lockPath: string, lock: LockInfo): Promise<void>;
export declare function buildLockInfo(): LockInfo;
//# sourceMappingURL=lock-io.d.ts.map