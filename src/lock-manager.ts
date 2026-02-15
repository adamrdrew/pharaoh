// Lock manager abstraction for single-instance enforcement

import type { LockInfo, LockResult } from './lock-types.js';
import type { Filesystem } from './status.js';
import type { PidChecker } from './lock-pid.js';
import { RealPidChecker } from './lock-pid.js';
import { acquireLock } from './lock-acquire.js';
import { validateLock } from './lock-validate.js';
import { releaseLock } from './lock-release.js';

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
export class RealLockManager implements LockManager {
  private currentLock?: LockInfo;

  constructor(
    private readonly fs: Filesystem,
    private readonly lockPath: string,
    private readonly pidChecker: PidChecker
  ) {}

  async acquire(): Promise<LockResult> {
    return acquireLock(
      this.fs,
      this.lockPath,
      this.pidChecker,
      (lock) => { this.currentLock = lock; }
    );
  }

  async validate(): Promise<boolean> {
    return validateLock(
      this.fs,
      this.lockPath,
      this.currentLock
    );
  }

  async release(): Promise<void> {
    await releaseLock(
      this.fs,
      this.lockPath,
      this.currentLock
    );
    this.currentLock = undefined;
  }
}

// Re-export for convenience
export { PidChecker, RealPidChecker } from './lock-pid.js';
