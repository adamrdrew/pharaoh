// Event builders for system and result messages
import { truncate, timestamp } from './event-builders-utils.js';
export function buildSystemInitEvent(message) {
    return createSystemInitEvent(message.model, message.tools, message.plugins);
}
function createSystemInitEvent(model, tools, plugins) {
    return { timestamp: timestamp(), type: 'status', summary: 'SDK initialized', detail: { model, tools_count: tools?.length, plugins_count: plugins?.length } };
}
export function buildSystemStatusEvent(message) {
    return { timestamp: timestamp(), type: 'status', summary: message.status ?? 'Status update', detail: { status: message.status } };
}
export function buildResultEvent(message) {
    return createResultEvent(message.num_turns, message.total_cost_usd);
}
function createResultEvent(turns, costUsd) {
    return { timestamp: timestamp(), type: 'result', summary: `Phase complete: ${turns} turns, $${costUsd.toFixed(2)}`, detail: { turns, cost_usd: costUsd } };
}
export function buildErrorEvent(message) {
    return createErrorEvent(message.errors, message.num_turns, message.total_cost_usd);
}
function createErrorEvent(errors, turns, costUsd) {
    const errorSummary = errors.join('; ');
    return { timestamp: timestamp(), type: 'error', summary: truncate(errorSummary, 200), detail: { errors, turns, cost_usd: costUsd } };
}
//# sourceMappingURL=event-builders-system.js.map