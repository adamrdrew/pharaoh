// Watcher helper functions

import { parseDispatchFile } from './parser.js';
import type { ProcessContext } from './watcher-context.js';

export async function checkFileExists(ctx: ProcessContext, path: string): Promise<boolean> {
  const exists = await ctx.fs.exists(path);
  if (!exists) await handleMissingFile(ctx, path);
  return exists;
}

async function handleMissingFile(ctx: ProcessContext, path: string): Promise<void> {
  await ctx.logger.warn('Dispatch file disappeared', { path });
  await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
}

export async function parseAndValidate(ctx: ProcessContext, path: string): Promise<{ ok: true; phase: string; body: string } | { ok: false }> {
  const content = await ctx.fs.readFile(path);
  const parseResult = parseDispatchFile(content);
  if (!parseResult.ok) return handleParseFailure(ctx, path, parseResult.error);
  return handleParseSuccess(ctx, path, parseResult.file);
}

async function handleParseFailure(ctx: ProcessContext, path: string, error: string): Promise<{ ok: false }> {
  await ctx.logger.error('Failed to parse dispatch file', { path, error });
  await ctx.fs.unlink(path);
  await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
  return { ok: false };
}

async function handleParseSuccess(ctx: ProcessContext, path: string, file: { phase?: string; model?: string; body: string }): Promise<{ ok: true; phase: string; body: string }> {
  await ctx.fs.unlink(path);
  await ctx.logger.info('Dispatch file parsed', { path, phase: file.phase, model: file.model });
  return { ok: true, phase: file.phase ?? 'unnamed-phase', body: file.body };
}

export async function reportPhaseComplete(ctx: ProcessContext, phaseName: string, result: { ok: boolean; costUsd: number; turns: number; error?: string }): Promise<void> {
  const timestamps = { phaseStarted: new Date().toISOString(), phaseCompleted: new Date().toISOString() };
  if (result.ok) await reportSuccess(ctx, phaseName, result, timestamps);
  else await reportFailure(ctx, phaseName, result, timestamps);
  await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
}

async function reportSuccess(ctx: ProcessContext, phaseName: string, result: { costUsd: number; turns: number }, timestamps: { phaseStarted: string; phaseCompleted: string }): Promise<void> {
  await ctx.status.setDone({ pid: ctx.pid, started: ctx.started, phase: phaseName, ...timestamps, costUsd: result.costUsd, turns: result.turns });
  await ctx.logger.info('Phase done', { phase: phaseName });
}

async function reportFailure(ctx: ProcessContext, phaseName: string, result: { costUsd: number; turns: number; error?: string }, timestamps: { phaseStarted: string; phaseCompleted: string }): Promise<void> {
  await ctx.status.setBlocked({ pid: ctx.pid, started: ctx.started, phase: phaseName, ...timestamps, error: result.error ?? 'Unknown error', costUsd: result.costUsd, turns: result.turns });
  await ctx.logger.error('Phase blocked', { phase: phaseName, error: result.error });
}
