// Lock release logic

import type { LockInfo } from './lock-types.js';
import type { Filesystem } from './status.js';
import { validateLock } from './lock-validate.js';

export async function releaseLock(
  fs: Filesystem,
  lockPath: string,
  current?: LockInfo
): Promise<void> {
  if (!current) return;
  const valid = await validateLock(
    fs,
    lockPath,
    current
  );
  if (!valid) return;
  await fs.unlink(lockPath);
}
