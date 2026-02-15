// Lock file I/O primitives

import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';
import { randomBytes } from 'crypto';

export async function writeLockFileExclusive(
  fs: Filesystem,
  lockPath: string,
  lock: LockInfo
): Promise<void> {
  await fs.openExclusive(
    lockPath,
    JSON.stringify(lock, null, 2)
  );
}

export async function writeLockFile(
  fs: Filesystem,
  lockPath: string,
  lock: LockInfo
): Promise<void> {
  await fs.writeFile(
    lockPath,
    JSON.stringify(lock, null, 2)
  );
}

export function buildLockInfo(): LockInfo {
  return {
    pid: process.pid,
    started: new Date().toISOString(),
    instanceId: randomBytes(8).toString('hex'),
  };
}
