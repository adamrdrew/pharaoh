// Phase completion verification logic
import { checkPhaseStatus } from './status-check.js';
export async function verifyPhaseCompletion(sdkResult, phaseName, cwd, pluginPath, logger) {
    const statusCheck = await checkPhaseStatus(cwd, pluginPath, logger);
    await logVerificationOutcome(sdkResult, statusCheck, phaseName, logger);
    return interpretPhaseStatus(sdkResult, statusCheck);
}
async function logVerificationOutcome(sdkResult, statusCheck, phaseName, logger) {
    const phaseStatus = statusCheck.ok ? statusCheck.status : statusCheck.error;
    await logger.info('Phase verification complete', { phase: phaseName, sdkSuccess: sdkResult.ok, phaseStatus });
}
function interpretPhaseStatus(sdkResult, statusCheck) {
    if (!sdkResult.ok)
        return sdkResult;
    if (!statusCheck.ok)
        return buildBlockedResult(sdkResult, `status check failed: ${statusCheck.error}`);
    return checkValidStatus(sdkResult, statusCheck);
}
function checkValidStatus(sdkResult, statusCheck) {
    const validStatuses = ['complete', 'reviewing', 'done'];
    const isValid = validStatuses.includes(statusCheck.status ?? '');
    return isValid ? sdkResult : buildBlockedResult(sdkResult, `phase loop incomplete — status: ${statusCheck.status}`);
}
function buildBlockedResult(sdkResult, error) {
    const { costUsd, turns, durationMs } = sdkResult;
    return { ok: false, reason: 'blocked', error, costUsd, turns, durationMs };
}
//# sourceMappingURL=runner-verification.js.map