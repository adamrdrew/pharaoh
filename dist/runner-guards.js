// Type guards for SDK messages
export function hasType(msg) {
    return typeof msg === 'object' && msg !== null && 'type' in msg && typeof msg.type === 'string';
}
export function isResultMessage(msg) {
    return hasType(msg) && msg.type === 'result' && hasSubtype(msg);
}
export function isAssistantMessage(msg) {
    return hasType(msg) && msg.type === 'assistant' && hasContent(msg);
}
export function isToolProgressMessage(msg) {
    return hasType(msg) && msg.type === 'tool_progress' && hasToolUseId(msg) && hasElapsedMillis(msg);
}
export function isToolSummaryMessage(msg) {
    return hasType(msg) && msg.type === 'tool_use_summary' && hasSummary(msg) && hasToolUseIds(msg);
}
export function isSystemMessage(msg) {
    return hasType(msg) && msg.type === 'system' && hasSubtype(msg);
}
function hasSubtype(msg) {
    return typeof msg === 'object' && msg !== null && 'subtype' in msg && typeof msg.subtype === 'string';
}
function hasContent(msg) {
    return typeof msg === 'object' && msg !== null && 'content' in msg && Array.isArray(msg.content);
}
function hasToolUseId(msg) {
    return typeof msg === 'object' && msg !== null && 'tool_use_id' in msg && typeof msg.tool_use_id === 'string';
}
function hasElapsedMillis(msg) {
    return typeof msg === 'object' && msg !== null && 'elapsed_millis' in msg && typeof msg.elapsed_millis === 'number';
}
function hasSummary(msg) {
    return typeof msg === 'object' && msg !== null && 'summary' in msg && typeof msg.summary === 'string';
}
function hasToolUseIds(msg) {
    return typeof msg === 'object' && msg !== null && 'tool_use_ids' in msg && Array.isArray(msg.tool_use_ids);
}
//# sourceMappingURL=runner-guards.js.map