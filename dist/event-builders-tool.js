// Event builders for tool messages
import { timestamp } from './event-builders-utils.js';
export function buildToolProgressEvent(message) {
    return { timestamp: timestamp(), type: 'tool_progress', summary: `Progress: ${message.elapsed_millis}ms`, detail: { tool_use_id: message.tool_use_id, elapsed_millis: message.elapsed_millis } };
}
export function buildToolSummaryEvent(message) {
    return createToolSummaryEvent(message.summary, message.tool_use_ids);
}
function createToolSummaryEvent(summary, toolUseIds) {
    return { timestamp: timestamp(), type: 'tool_summary', summary, detail: { tool_use_ids: toolUseIds } };
}
//# sourceMappingURL=event-builders-tool.js.map