// Hook handlers for SDK PreToolUse hooks

import type { Logger } from './log.js';
import { checkPathViolation } from './runner-path-validation.js';

export async function handlePathViolation(path: string, allowedPaths: string[], logger: Logger, phaseName: string): Promise<unknown> {
  await logger.info('Blocked path outside allowed directories', { phase: phaseName, path, allowed: allowedPaths });
  return { continue: true, decision: 'block', reason: `Path "${path}" is outside the permitted directories. Allowed: ${allowedPaths.join(', ')}` };
}

export function createBlockHook(allowedPaths: string[], logger: Logger, phaseName: string): (input: unknown) => Promise<unknown> {
  return async (input: unknown): Promise<unknown> => {
    const typedInput = input as { hook_event_name?: string; tool_name?: string; tool_input?: Record<string, unknown> };
    if (isSandboxBypass(typedInput)) return handleSandboxBypass(logger, phaseName);
    if (isAskUserQuestion(typedInput)) return handleBlockedQuestion(logger, phaseName);
    const pathViolation = checkPathViolation(typedInput, allowedPaths);
    if (pathViolation) return handlePathViolation(pathViolation, allowedPaths, logger, phaseName);
    return { continue: true };
  };
}

function isSandboxBypass(input: { tool_name?: string; tool_input?: Record<string, unknown> }): boolean {
  return input.tool_name === 'Bash' && input.tool_input?.dangerouslyDisableSandbox === true;
}

async function handleSandboxBypass(logger: Logger, phaseName: string): Promise<unknown> {
  await logger.info('Blocked dangerouslyDisableSandbox', { phase: phaseName });
  return { continue: true, decision: 'block', reason: 'dangerouslyDisableSandbox is not permitted. Fix the underlying issue instead of disabling the sandbox.' };
}

function isAskUserQuestion(input: { hook_event_name?: string; tool_name?: string }): boolean {
  return input.hook_event_name === 'PreToolUse' && input.tool_name === 'AskUserQuestion';
}

async function handleBlockedQuestion(logger: Logger, phaseName: string): Promise<unknown> {
  await logger.info('Blocked AskUserQuestion', { phase: phaseName });
  return { continue: true, decision: 'block', systemMessage: 'Proceed with your best judgement' };
}
