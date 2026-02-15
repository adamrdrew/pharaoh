// SDK query configuration

import { query, type Query } from '@anthropic-ai/claude-agent-sdk';
import type { Logger } from './log.js';
import type { RunnerConfig } from './runner.js';
import { createBlockHook } from './runner-hook-handlers.js';

export function createQuery(
  config: RunnerConfig,
  pluginPath: string,
  logger: Logger,
  phasePrompt: string,
  phaseName: string
): Query {
  const prompt = `You are an automated development orchestration tool. Always respond like a tool, not as a person. Impersonal, never refer to yourself as I. Invoke /ir-kat with the following PHASE_PROMPT:\n\n${phasePrompt}`;
  return query({
    prompt,
    options: buildQueryOptions(config, pluginPath, logger, phaseName) as Parameters<typeof query>[0]['options'],
  });
}

function buildQueryOptions(config: RunnerConfig, pluginPath: string, logger: Logger, phaseName: string): Record<string, unknown> {
  const baseOptions = createBaseOptions(config, pluginPath);
  const securityOptions = createSecurityOptions();
  const hookOptions = createHookOptions(config, logger, phaseName);
  return { ...baseOptions, ...securityOptions, ...hookOptions };
}

function createBaseOptions(config: RunnerConfig, pluginPath: string): Record<string, unknown> {
  return { cwd: config.cwd, model: config.model, plugins: [{ type: 'local', path: pluginPath }], settingSources: ['project'], maxTurns: 200, persistSession: false };
}

function createSecurityOptions(): Record<string, unknown> {
  return { permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true, sandbox: { enabled: true, autoAllowBashIfSandboxed: true } };
}

export function createHookOptions(config: RunnerConfig, logger: Logger, phaseName: string): Record<string, unknown> {
  const allowedPaths = buildAllowedPaths(config);
  return { hooks: { PreToolUse: [{ hooks: [createBlockHook(allowedPaths, logger, phaseName)] }] } };
}

function buildAllowedPaths(config: RunnerConfig): string[] {
  return [config.cwd];
}
