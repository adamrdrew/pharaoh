// Event builders for tool messages
import { timestamp } from './event-builders-utils.js';
export function buildToolProgressEvent(message) {
    const label = message.tool_name ?? message.tool_use_id;
    return { timestamp: timestamp(), type: 'tool_progress', summary: `${label}: ${message.elapsed_time_seconds}s`, detail: { tool_use_id: message.tool_use_id, tool_name: message.tool_name, elapsed_seconds: message.elapsed_time_seconds } };
}
export function buildToolSummaryEvent(message) {
    return createToolSummaryEvent(message.summary, message.preceding_tool_use_ids);
}
function createToolSummaryEvent(summary, toolUseIds) {
    return { timestamp: timestamp(), type: 'tool_summary', summary, detail: { preceding_tool_use_ids: toolUseIds } };
}
//# sourceMappingURL=event-builders-tool.js.map