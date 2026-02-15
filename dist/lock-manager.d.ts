import type { LockResult } from './lock-types.js';
import type { Filesystem } from './status.js';
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
/**
 * PID liveness checker interface for testing
 */
export interface PidChecker {
    isRunning(pid: number): boolean;
}
/**
 * Real PID checker using process.kill(pid, 0)
 */
export declare class RealPidChecker implements PidChecker {
    isRunning(pid: number): boolean;
}
//# sourceMappingURL=lock-manager.d.ts.map