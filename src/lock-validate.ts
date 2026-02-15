// Lock validation logic

import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';

export async function validateLock(
  fs: Filesystem,
  lockPath: string,
  current?: LockInfo
): Promise<boolean> {
  if (!current) return false;
  const exists = await fs.exists(lockPath);
  if (!exists) return false;
  const content = await fs.readFile(lockPath);
  const stored = JSON.parse(content) as LockInfo;
  return matchesCurrentLock(stored, current);
}

export function matchesCurrentLock(
  stored: LockInfo,
  current: LockInfo
): boolean {
  return stored.instanceId === current.instanceId;
}
