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
    const result = await executeStatusQuery(cwd, pluginPath, logger);
    const status = extractPhaseStatus(result);
    await logger.debug('Status check raw output', { outputLength: result.length, outputPreview: result.slice(0, 500), parsedStatus: status });
    return { ok: true, status };
  } catch (err) {
    return buildErrorResult(logger, err);
  }
}

async function executeStatusQuery(cwd: string, pluginPath: string, logger: Logger): Promise<string> {
  let output = '';
  const q = query({ prompt: 'Run /phase-status latest — output only the PHASE_STATUS block, nothing else.', options: buildQueryOptions(cwd, pluginPath) });
  for await (const message of q) {
    const msg = message as { type?: string };
    const extracted = extractMessageContent(message);
    if (extracted.length > 0) await logger.debug('Status check content extracted', { type: msg.type, length: extracted.length });
    if (msg.type === 'assistant' && extracted.length === 0) await logger.debug('Status check assistant message had no text content', { messageKeys: Object.keys(message as Record<string, unknown>) });
    output += extracted;
  }
  return output;
}

function buildQueryOptions(cwd: string, pluginPath: string): Record<string, unknown> {
  return { cwd, model: 'claude-sonnet-4-20250514', plugins: [{ type: 'local', path: pluginPath }], settingSources: ['project'], maxTurns: 10, persistSession: false };
}

function extractMessageContent(message: unknown): string {
  const msg = message as { type?: string; message?: { content?: Array<{ type?: string; text?: string }> } };
  if (msg.type !== 'assistant' || !Array.isArray(msg.message?.content)) return '';
  return msg.message.content
    .filter((b): b is { type: string; text: string } => b.type === 'text' && typeof b.text === 'string')
    .map(b => b.text)
    .join('');
}

function extractPhaseStatus(output: string): string {
  const statusMatch = output.match(/^\s*status:\s*(\S+)/m);
  return statusMatch?.[1] ?? 'unknown';
}

async function buildErrorResult(logger: Logger, err: unknown): Promise<StatusCheckResult> {
  await logger.warn('Phase status check failed', { error: String(err) });
  return { ok: false, error: String(err) };
}
