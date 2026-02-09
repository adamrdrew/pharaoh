// Type guards for SDK messages
export function hasType(msg) {
    return typeof msg === 'object' && msg !== null && 'type' in msg && typeof msg.type === 'string';
}
export function isResultMessage(msg) {
    return hasType(msg) && msg.type === 'result' && hasSubtype(msg);
}
export function isAssistantMessage(msg) {
    return hasType(msg) && msg.type === 'assistant' && hasMessageWithContent(msg);
}
export function isToolProgressMessage(msg) {
    return hasType(msg) && msg.type === 'tool_progress' && hasToolUseId(msg) && hasElapsedTimeSeconds(msg);
}
export function isToolSummaryMessage(msg) {
    return hasType(msg) && msg.type === 'tool_use_summary' && hasSummary(msg) && hasPrecedingToolUseIds(msg);
}
export function isSystemMessage(msg) {
    return hasType(msg) && msg.type === 'system' && hasSubtype(msg);
}
function hasSubtype(msg) {
    return typeof msg === 'object' && msg !== null && 'subtype' in msg && typeof msg.subtype === 'string';
}
function hasMessageWithContent(msg) {
    if (typeof msg !== 'object' || msg === null || !('message' in msg))
        return false;
    const inner = msg.message;
    return typeof inner === 'object' && inner !== null && 'content' in inner && Array.isArray(inner.content);
}
function hasToolUseId(msg) {
    return typeof msg === 'object' && msg !== null && 'tool_use_id' in msg && typeof msg.tool_use_id === 'string';
}
function hasElapsedTimeSeconds(msg) {
    return typeof msg === 'object' && msg !== null && 'elapsed_time_seconds' in msg && typeof msg.elapsed_time_seconds === 'number';
}
function hasSummary(msg) {
    return typeof msg === 'object' && msg !== null && 'summary' in msg && typeof msg.summary === 'string';
}
function hasPrecedingToolUseIds(msg) {
    return typeof msg === 'object' && msg !== null && 'preceding_tool_use_ids' in msg && Array.isArray(msg.preceding_tool_use_ids);
}
//# sourceMappingURL=runner-guards.js.map