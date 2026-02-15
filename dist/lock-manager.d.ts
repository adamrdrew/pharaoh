import type { LockResult } from './lock-types.js';
import type { Filesystem } from './status.js';
import type { PidChecker } from './lock-pid.js';
/**
 * Lock manager interface for dependency injection
 */
export interface LockManager {
    acquire(): Promise<LockResult>;
    validate(): Promise<boolean>;
    release(): Promise<void>;
}
/**
 * Real lock manager using filesystem-based PID locking
 */
export declare class RealLockManager implements LockManager {
    private readonly fs;
    private readonly lockPath;
    private readonly pidChecker;
    private currentLock?;
    constructor(fs: Filesystem, lockPath: string, pidChecker: PidChecker);
    acquire(): Promise<LockResult>;
    validate(): Promise<boolean>;
    release(): Promise<void>;
}
export { PidChecker, RealPidChecker } from './lock-pid.js';
//# sourceMappingURL=lock-manager.d.ts.map