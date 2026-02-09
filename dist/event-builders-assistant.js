// Event builders for assistant messages
import { truncate, timestamp } from './event-builders-utils.js';
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
//# sourceMappingURL=event-builders-assistant.js.map