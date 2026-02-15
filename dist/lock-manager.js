// Lock manager abstraction for single-instance enforcement
import { acquireLock } from './lock-acquire.js';
import { validateLock } from './lock-validate.js';
import { releaseLock } from './lock-release.js';
/**
 * Real lock manager using filesystem-based PID locking
 */
export class RealLockManager {
    fs;
    lockPath;
    pidChecker;
    currentLock;
    constructor(fs, lockPath, pidChecker) {
        this.fs = fs;
        this.lockPath = lockPath;
        this.pidChecker = pidChecker;
    }
    async acquire() {
        return acquireLock(this.fs, this.lockPath, this.pidChecker, (lock) => { this.currentLock = lock; });
    }
    async validate() {
        return validateLock(this.fs, this.lockPath, this.currentLock);
    }
    async release() {
        await releaseLock(this.fs, this.lockPath, this.currentLock);
        this.currentLock = undefined;
    }
}
export { RealPidChecker } from './lock-pid.js';
//# sourceMappingURL=lock-manager.js.map