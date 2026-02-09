// SDK message handling
import { buildSuccessResult, buildFailureResult } from './runner-results.js';
export async function handleResultMessage(message, logger, phaseName, startTime) {
    const durationMs = Date.now() - startTime;
    const turns = message.num_turns;
    const costUsd = message.total_cost_usd;
    if (message.subtype === 'success') {
        return buildSuccessResult(logger, phaseName, turns, costUsd, durationMs);
    }
    const errors = message.errors.join('; ');
    return buildFailureResult(logger, phaseName, message.subtype, errors, turns, costUsd, durationMs);
}
export async function handleAssistantMessage(logger, phaseName, messageCounter) {
    await logger.debug('Assistant message received', {
        phase: phaseName,
        message: messageCounter,
    });
}
export async function handleSystemMessage(logger, phaseName, status) {
    await logger.debug('SDK status', { phase: phaseName, status });
}
//# sourceMappingURL=runner-messages.js.map