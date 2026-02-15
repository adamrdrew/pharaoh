// Fake lock manager for testing

import type { LockManager, PidChecker } from '../../src/lock-manager.js';
import type { LockResult, LockInfo } from '../../src/lock-types.js';
import { LockError } from '../../src/lock-types.js';

export class FakeLockManager implements LockManager {
  private acquired: boolean = false;
  private lockInfo?: LockInfo;
  private shouldFailValidation: boolean = false;

  async acquire(): Promise<LockResult> {
    return acquireFakeLock(this);
  }

  async validate(): Promise<boolean> {
    return validateFakeLock(this);
  }

  async release(): Promise<void> {
    releaseFakeLock(this);
  }

  simulateLockStolen(): void {
    this.shouldFailValidation = true;
  }

  isAcquired(): boolean {
    return this.acquired;
  }
}

export class FakePidChecker implements PidChecker {
  private runningPids: Set<number> = new Set();

  isRunning(pid: number): boolean {
    return this.runningPids.has(pid);
  }

  setRunning(pid: number): void {
    this.runningPids.add(pid);
  }

  setNotRunning(pid: number): void {
    this.runningPids.delete(pid);
  }
}

function acquireFakeLock(
  fake: FakeLockManager
): LockResult {
  const lock = buildFakeLockInfo();
  (fake as { acquired: boolean }).acquired = true;
  (fake as { lockInfo?: LockInfo }).lockInfo = lock;
  return { ok: true, value: lock };
}

function validateFakeLock(fake: FakeLockManager): boolean {
  if ((fake as { shouldFailValidation: boolean }).shouldFailValidation) {
    return false;
  }
  return (fake as { acquired: boolean }).acquired;
}

function releaseFakeLock(fake: FakeLockManager): void {
  (fake as { acquired: boolean }).acquired = false;
  (fake as { lockInfo?: LockInfo }).lockInfo = undefined;
}

function buildFakeLockInfo(): LockInfo {
  return {
    pid: 12345,
    started: new Date().toISOString(),
    instanceId: 'fake-instance-id',
  };
}

export function createHeldLock(): LockResult {
  const existingLock = buildFakeLockInfo();
  return {
    ok: false,
    error: new LockError('acquire', 'lock held by another process', existingLock),
  };
}

export function createStaleLock(stalePid: number): LockInfo {
  return {
    pid: stalePid,
    started: new Date(Date.now() - 3600000).toISOString(),
    instanceId: 'stale-instance-id',
  };
}
