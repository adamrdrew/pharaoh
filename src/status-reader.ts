// Status file reader with validation

import type { ServiceStatus } from './types.js';
import type { Filesystem } from './status.js';
import { isValidServiceStatus } from './validation.js';

export type ReadResult =
  | { readonly ok: true; readonly status: ServiceStatus }
  | { readonly ok: false; readonly error: string };

export async function readStatus(
  fs: Filesystem,
  statusPath: string
): Promise<ReadResult> {
  const exists = await fs.exists(statusPath);
  if (!exists) {
    return { ok: false, error: 'Status file does not exist' };
  }
  const content = await fs.readFile(statusPath);
  return parseStatusContent(content);
}

function parseStatusContent(content: string): ReadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to parse pharaoh.json: ${message}` };
  }
  if (!isValidServiceStatus(parsed)) {
    return { ok: false, error: 'Invalid pharaoh.json structure' };
  }
  return { ok: true, status: parsed };
}
