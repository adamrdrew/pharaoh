// Atomic status file writer

import type { ServiceStatus } from './types.js';
import type { Filesystem } from './status.js';

export async function writeStatus(
  fs: Filesystem,
  statusPath: string,
  status: ServiceStatus
): Promise<void> {
  const tmpPath = `${statusPath}.tmp`;
  const content = JSON.stringify(status, null, 2);
  await fs.writeFile(tmpPath, content);
  await fs.rename(tmpPath, statusPath);
}
