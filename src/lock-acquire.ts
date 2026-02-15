// Lock acquisition logic

import type { LockInfo, LockResult } from './lock-types.js';
import { LockError } from './lock-types.js';
import type { Filesystem } from './status.js';
import type { PidChecker } from './lock-pid.js';
import {
  buildLockInfo,
  writeLockFileExclusive,
  writeLockFile,
} from './lock-io.js';

export async function acquireLock(
  fs: Filesystem,
  lockPath: string,
  pidChecker: PidChecker,
  onAcquired: (lock: LockInfo) => void
): Promise<LockResult> {
  const lock = buildLockInfo();
  try {
    await writeLockFileExclusive(fs, lockPath, lock);
    onAcquired(lock);
    return { ok: true, value: lock };
  } catch (err) {
    return handleAcquireFailure(
      fs,
      lockPath,
      pidChecker,
      onAcquired
    );
  }
}

export async function handleAcquireFailure(
  fs: Filesystem,
  lockPath: string,
  pidChecker: PidChecker,
  onAcquired: (lock: LockInfo) => void
): Promise<LockResult> {
  const exists = await fs.exists(lockPath);
  if (!exists) throw new Error('Lock acquire failed but file does not exist');
  const content = await fs.readFile(lockPath);
  const existing = JSON.parse(content) as LockInfo;
  const running = pidChecker.isRunning(existing.pid);
  if (running) return buildHeldResult(existing);
  return overwriteStaleLock(
    fs,
    lockPath,
    onAcquired
  );
}

export function buildHeldResult(
  existing: LockInfo
): LockResult {
  return {
    ok: false,
    error: new LockError(
      'acquire',
      'lock held by another process',
      existing
    ),
  };
}

export async function overwriteStaleLock(
  fs: Filesystem,
  lockPath: string,
  onAcquired: (lock: LockInfo) => void
): Promise<LockResult> {
  const lock = buildLockInfo();
  await writeLockFile(fs, lockPath, lock);
  onAcquired(lock);
  return { ok: true, value: lock };
}
