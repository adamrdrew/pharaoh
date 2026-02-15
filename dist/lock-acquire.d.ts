import type { LockInfo, LockResult } from './lock-types.js';
import type { Filesystem } from './status.js';
import type { PidChecker } from './lock-pid.js';
export declare function acquireLock(fs: Filesystem, lockPath: string, pidChecker: PidChecker, onAcquired: (lock: LockInfo) => void): Promise<LockResult>;
export declare function handleAcquireFailure(fs: Filesystem, lockPath: string, pidChecker: PidChecker, onAcquired: (lock: LockInfo) => void): Promise<LockResult>;
export declare function buildHeldResult(existing: LockInfo): LockResult;
export declare function overwriteStaleLock(fs: Filesystem, lockPath: string, onAcquired: (lock: LockInfo) => void): Promise<LockResult>;
//# sourceMappingURL=lock-acquire.d.ts.map