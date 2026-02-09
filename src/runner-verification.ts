// Phase completion verification logic

import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import { checkPhaseStatus } from './status-check.js';

export async function verifyPhaseCompletion(
  sdkResult: PhaseResult,
  phaseName: string,
  cwd: string,
  pluginPath: string,
  logger: Logger
): Promise<PhaseResult> {
  const statusCheck = await checkPhaseStatus(cwd, pluginPath, logger);
  await logVerificationOutcome(sdkResult, statusCheck, phaseName, logger);
  return interpretPhaseStatus(sdkResult, statusCheck);
}

async function logVerificationOutcome(
  sdkResult: PhaseResult,
  statusCheck: { ok: boolean; status?: string; error?: string },
  phaseName: string,
  logger: Logger
): Promise<void> {
  const phaseStatus = statusCheck.ok ? statusCheck.status : statusCheck.error;
  await logger.info('Phase verification complete', { phase: phaseName, sdkSuccess: sdkResult.ok, phaseStatus });
}

function interpretPhaseStatus(
  sdkResult: PhaseResult,
  statusCheck: { ok: boolean; status?: string; error?: string }
): PhaseResult {
  if (!sdkResult.ok) return sdkResult;
  if (!statusCheck.ok) return buildBlockedResult(sdkResult, `status check failed: ${statusCheck.error}`);
  return checkValidStatus(sdkResult, statusCheck);
}

function checkValidStatus(
  sdkResult: PhaseResult,
  statusCheck: { status?: string }
): PhaseResult {
  const validStatuses = ['complete', 'reviewing', 'done'];
  const isValid = validStatuses.includes(statusCheck.status ?? '');
  return isValid ? sdkResult : buildBlockedResult(sdkResult, `phase loop incomplete — status: ${statusCheck.status}`);
}

function buildBlockedResult(sdkResult: PhaseResult, error: string): PhaseResult {
  const { costUsd, turns, durationMs } = sdkResult;
  return { ok: false, reason: 'blocked', error, costUsd, turns, durationMs };
}
