// Phase result builders
export async function buildSuccessResult(logger, phaseName, turns, costUsd, durationMs) {
    await logSuccess(logger, phaseName, turns, costUsd, durationMs);
    return { ok: true, costUsd, turns, durationMs };
}
async function logSuccess(logger, phaseName, turns, costUsd, durationMs) {
    await logger.info('Phase completed successfully', { phase: phaseName, turns, maxTurns: 200, costUsd, durationMs });
}
export async function buildFailureResult(logger, phaseName, subtype, errors, turns, costUsd, durationMs) {
    await logFailure(logger, phaseName, subtype, errors, turns, costUsd);
    return createFailureResult(subtype, errors, turns, costUsd, durationMs);
}
async function logFailure(logger, phaseName, subtype, errors, turns, costUsd) {
    await logger.error('Phase failed', { phase: phaseName, subtype, errors, turns, costUsd });
}
function createFailureResult(subtype, errors, turns, costUsd, durationMs) {
    if (subtype === 'error_max_turns')
        return { ok: false, reason: 'max_turns', error: `Max turns reached: ${errors}`, costUsd, turns, durationMs };
    return { ok: false, reason: 'sdk_error', error: errors, costUsd, turns, durationMs };
}
export async function buildNoResultError(logger, phaseName, costUsd, turns, durationMs) {
    await logger.error('Phase ended without result', { phase: phaseName });
    return createNoResultError(costUsd, turns, durationMs);
}
function createNoResultError(costUsd, turns, durationMs) {
    return { ok: false, reason: 'sdk_error', error: 'Query ended without result message', costUsd, turns, durationMs };
}
//# sourceMappingURL=runner-results.js.map