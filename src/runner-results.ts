// Phase result builders

import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';

export async function buildSuccessResult(logger: Logger, phaseName: string, turns: number, costUsd: number, durationMs: number): Promise<PhaseResult> {
  await logSuccess(logger, phaseName, turns, costUsd, durationMs);
  return { ok: true, costUsd, turns, durationMs };
}

async function logSuccess(logger: Logger, phaseName: string, turns: number, costUsd: number, durationMs: number): Promise<void> {
  await logger.info('Phase completed successfully', { phase: phaseName, turns, maxTurns: 200, costUsd, durationMs });
}

export async function buildFailureResult(logger: Logger, phaseName: string, subtype: string, errors: string, turns: number, costUsd: number, durationMs: number): Promise<PhaseResult> {
  await logFailure(logger, phaseName, subtype, errors, turns, costUsd);
  return createFailureResult(subtype, errors, turns, costUsd, durationMs);
}

async function logFailure(logger: Logger, phaseName: string, subtype: string, errors: string, turns: number, costUsd: number): Promise<void> {
  await logger.error('Phase failed', { phase: phaseName, subtype, errors, turns, costUsd });
}

function createFailureResult(subtype: string, errors: string, turns: number, costUsd: number, durationMs: number): PhaseResult {
  if (subtype === 'error_max_turns') return { ok: false, reason: 'max_turns', error: `Max turns reached: ${errors}`, costUsd, turns, durationMs };
  return { ok: false, reason: 'sdk_error', error: errors, costUsd, turns, durationMs };
}

export async function buildNoResultError(logger: Logger, phaseName: string, costUsd: number, turns: number, durationMs: number): Promise<PhaseResult> {
  await logger.error('Phase ended without result', { phase: phaseName });
  return createNoResultError(costUsd, turns, durationMs);
}

function createNoResultError(costUsd: number, turns: number, durationMs: number): PhaseResult {
  return { ok: false, reason: 'sdk_error', error: 'Query ended without result message', costUsd, turns, durationMs };
}
