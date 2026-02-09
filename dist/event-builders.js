// Event builder functions for SDK messages
function truncate(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
function timestamp() {
    return new Date().toISOString();
}
export function buildAssistantToolCallEvent(message, toolUse) {
    const inputJson = JSON.stringify(toolUse.input);
    return createToolCallEvent(toolUse.name, toolUse.id, inputJson);
}
function createToolCallEvent(toolName, toolId, inputJson) {
    return { timestamp: timestamp(), type: 'tool_call', summary: `Tool: ${toolName}`, detail: { tool_use_id: toolId, tool_name: toolName, input: truncate(inputJson, 500) } };
}
export function buildAssistantTextEvent(message, textBlock) {
    return { timestamp: timestamp(), type: 'text', summary: truncate(textBlock.text, 200), detail: { full_text: textBlock.text } };
}
export function buildAssistantTurnEvent(message, turnNumber) {
    return createTurnEvent(turnNumber, message.usage);
}
function createTurnEvent(turnNumber, usage) {
    return { timestamp: timestamp(), type: 'turn', summary: `Turn ${turnNumber}`, detail: { turn: turnNumber, input_tokens: usage?.input_tokens, output_tokens: usage?.output_tokens } };
}
export function buildToolProgressEvent(message) {
    return { timestamp: timestamp(), type: 'tool_progress', summary: `Progress: ${message.elapsed_millis}ms`, detail: { tool_use_id: message.tool_use_id, elapsed_millis: message.elapsed_millis } };
}
export function buildToolSummaryEvent(message) {
    return createToolSummaryEvent(message.summary, message.tool_use_ids);
}
function createToolSummaryEvent(summary, toolUseIds) {
    return { timestamp: timestamp(), type: 'tool_summary', summary, detail: { tool_use_ids: toolUseIds } };
}
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
//# sourceMappingURL=event-builders.js.map