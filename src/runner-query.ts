// SDK query configuration

import { query, type Query } from '@anthropic-ai/claude-agent-sdk';
import type { Logger } from './log.js';
import type { RunnerConfig } from './runner.js';

export function createQuery(
  config: RunnerConfig,
  logger: Logger,
  phasePrompt: string,
  phaseName: string
): Query {
  const prompt = `Invoke /ir-kat with the following PHASE_PROMPT:\n\n${phasePrompt}`;
  return query({
    prompt,
    options: buildQueryOptions(config, logger, phaseName) as Parameters<typeof query>[0]['options'],
  });
}

function buildQueryOptions(config: RunnerConfig, logger: Logger, phaseName: string): Record<string, unknown> {
  const baseOptions = createBaseOptions(config);
  const securityOptions = createSecurityOptions();
  const hookOptions = createHookOptions(logger, phaseName);
  return { ...baseOptions, ...securityOptions, ...hookOptions };
}

function createBaseOptions(config: RunnerConfig): Record<string, unknown> {
  return { cwd: config.cwd, model: config.model, plugins: [{ type: 'local', path: config.pluginPath }], settingSources: ['project'], maxTurns: 200, persistSession: false };
}

function createSecurityOptions(): Record<string, unknown> {
  return { permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true, sandbox: { enabled: true, autoAllowBashIfSandboxed: true } };
}

function createHookOptions(logger: Logger, phaseName: string): Record<string, unknown> {
  return { hooks: { PreToolUse: [{ hooks: [createBlockHook(logger, phaseName)] }] } };
}

function createBlockHook(logger: Logger, phaseName: string): (input: unknown) => Promise<unknown> {
  return async (input: unknown): Promise<unknown> => {
    const typedInput = input as { hook_event_name?: string; tool_name?: string };
    if (isAskUserQuestion(typedInput)) return handleBlockedQuestion(logger, phaseName);
    return { continue: true };
  };
}

function isAskUserQuestion(input: { hook_event_name?: string; tool_name?: string }): boolean {
  return input.hook_event_name === 'PreToolUse' && input.tool_name === 'AskUserQuestion';
}

async function handleBlockedQuestion(logger: Logger, phaseName: string): Promise<unknown> {
  await logger.info('Blocked AskUserQuestion', { phase: phaseName });
  return { continue: true, decision: 'block', systemMessage: 'Proceed with your best judgement' };
}
