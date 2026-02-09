// Phase status verification via SDK query

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Logger } from './log.js';

export type StatusCheckResult =
  | { ok: true; status: string }
  | { ok: false; error: string };

export async function checkPhaseStatus(
  cwd: string,
  pluginPath: string,
  logger: Logger
): Promise<StatusCheckResult> {
  try {
    const result = await executeStatusQuery(cwd, pluginPath);
    const status = extractPhaseStatus(result);
    return { ok: true, status };
  } catch (err) {
    return buildErrorResult(logger, err);
  }
}

async function executeStatusQuery(cwd: string, pluginPath: string): Promise<string> {
  let output = '';
  const q = query({ prompt: '/phase-status latest', options: buildQueryOptions(cwd, pluginPath) });
  for await (const message of q) {
    output += extractMessageContent(message);
  }
  return output;
}

function buildQueryOptions(cwd: string, pluginPath: string): Record<string, unknown> {
  return { cwd, model: 'claude-sonnet-4-20250514', plugins: [{ type: 'local', path: pluginPath }], settingSources: ['project'], maxTurns: 5, persistSession: false };
}

function extractMessageContent(message: unknown): string {
  const msg = message as { type?: string; content?: string };
  return msg.type === 'assistant' && typeof msg.content === 'string' ? msg.content : '';
}

function extractPhaseStatus(output: string): string {
  const statusMatch = output.match(/"status":\s*"([^"]+)"/);
  return statusMatch?.[1] ?? 'unknown';
}

async function buildErrorResult(logger: Logger, err: unknown): Promise<StatusCheckResult> {
  await logger.warn('Phase status check failed', { error: String(err) });
  return { ok: false, error: String(err) };
}
