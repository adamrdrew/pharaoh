// SDK message handling

import type { Logger } from './log.js';
import type { PhaseResult } from './types.js';
import { buildSuccessResult, buildFailureResult } from './runner-results.js';

export async function handleResultMessage(
  message: { type: 'result'; subtype: string; num_turns: number; total_cost_usd: number; errors: string[] },
  logger: Logger,
  phaseName: string,
  startTime: number
): Promise<PhaseResult> {
  const durationMs = Date.now() - startTime;
  const turns = message.num_turns;
  const costUsd = message.total_cost_usd;
  if (message.subtype === 'success') {
    return buildSuccessResult(logger, phaseName, turns, costUsd, durationMs);
  }
  const errors = message.errors.join('; ');
  return buildFailureResult(logger, phaseName, message.subtype, errors, turns, costUsd, durationMs);
}

export async function handleAssistantMessage(
  logger: Logger,
  phaseName: string,
  messageCounter: number
): Promise<void> {
  await logger.debug('Assistant message received', {
    phase: phaseName,
    message: messageCounter,
  });
}

export async function handleSystemMessage(
  logger: Logger,
  phaseName: string,
  status: string
): Promise<void> {
  await logger.debug('SDK status', { phase: phaseName, status });
}
