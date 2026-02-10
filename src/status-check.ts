// Phase status verification via direct filesystem read

import { join } from 'path';
import type { Logger } from './log.js';
import type { Filesystem } from './status.js';
import { findLatestPhaseDir } from './status-check-finder.js';
import { parsePhaseStatus } from './status-check-parser.js';

export type StatusCheckResult =
  | { ok: true; status: string }
  | { ok: false; error: string };

export async function checkPhaseStatus(
  cwd: string,
  fs: Filesystem,
  logger: Logger
): Promise<StatusCheckResult> {
  try {
    const dirResult = await findLatestPhaseDir(cwd, fs);
    if (!dirResult.ok) return dirResult;
    const progressPath = join(dirResult.status, 'progress.yaml');
    const yamlContent = await fs.readFile(progressPath);
    return parsePhaseStatus(yamlContent);
  } catch (err) {
    return buildErrorResult(logger, err);
  }
}

async function buildErrorResult(logger: Logger, err: unknown): Promise<StatusCheckResult> {
  await logger.warn('Phase status check failed', { error: String(err) });
  return { ok: false, error: String(err) };
}
