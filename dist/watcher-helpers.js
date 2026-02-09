// Watcher helper functions
import { parseDispatchFile } from './parser.js';
export async function checkFileExists(ctx, path) {
    const exists = await ctx.fs.exists(path);
    if (!exists)
        await handleMissingFile(ctx, path);
    return exists;
}
async function handleMissingFile(ctx, path) {
    await ctx.logger.warn('Dispatch file disappeared', { path });
    await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
}
export async function parseAndValidate(ctx, path) {
    const content = await ctx.fs.readFile(path);
    const parseResult = parseDispatchFile(content);
    if (!parseResult.ok)
        return handleParseFailure(ctx, path, parseResult.error);
    return handleParseSuccess(ctx, path, parseResult.file);
}
async function handleParseFailure(ctx, path, error) {
    await ctx.logger.error('Failed to parse dispatch file', { path, error });
    await ctx.fs.unlink(path);
    await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
    return { ok: false };
}
async function handleParseSuccess(ctx, path, file) {
    await ctx.fs.unlink(path);
    await ctx.logger.info('Dispatch file parsed', { path, phase: file.phase, model: file.model });
    return { ok: true, phase: file.phase ?? 'unnamed-phase', body: file.body };
}
export async function reportPhaseComplete(ctx, phaseName, result) {
    const timestamps = { phaseStarted: new Date().toISOString(), phaseCompleted: new Date().toISOString() };
    if (result.ok)
        await reportSuccess(ctx, phaseName, result, timestamps);
    else
        await reportFailure(ctx, phaseName, result, timestamps);
    await ctx.status.setIdle({ pid: ctx.pid, started: ctx.started });
}
async function reportSuccess(ctx, phaseName, result, timestamps) {
    await ctx.status.setDone({ pid: ctx.pid, started: ctx.started, phase: phaseName, ...timestamps, costUsd: result.costUsd, turns: result.turns });
    await ctx.logger.info('Phase done', { phase: phaseName });
}
async function reportFailure(ctx, phaseName, result, timestamps) {
    await ctx.status.setBlocked({ pid: ctx.pid, started: ctx.started, phase: phaseName, ...timestamps, error: result.error ?? 'Unknown error', costUsd: result.costUsd, turns: result.turns });
    await ctx.logger.error('Phase blocked', { phase: phaseName, error: result.error });
}
//# sourceMappingURL=watcher-helpers.js.map