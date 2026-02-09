// Event capture for assistant messages
import { buildAssistantToolCallEvent, buildAssistantTextEvent, buildAssistantTurnEvent, } from './event-builders-assistant.js';
export async function captureAssistantEvents(message, turnNumber, eventWriter) {
    await captureContentEvents(message, eventWriter);
    await captureTurnEvent(message, turnNumber, eventWriter);
}
async function captureContentEvents(message, eventWriter) {
    for (const block of message.content) {
        await captureContentBlock(message, block, eventWriter);
    }
}
async function captureContentBlock(message, block, eventWriter) {
    if (block.type === 'tool_use')
        await captureToolUse(message, block, eventWriter);
    if (block.type === 'text')
        await captureText(message, block, eventWriter);
}
async function captureToolUse(message, block, eventWriter) {
    const event = buildAssistantToolCallEvent(message, block);
    await eventWriter.write(event);
}
async function captureText(message, block, eventWriter) {
    const event = buildAssistantTextEvent(message, block);
    await eventWriter.write(event);
}
async function captureTurnEvent(message, turnNumber, eventWriter) {
    const event = buildAssistantTurnEvent(message, turnNumber);
    await eventWriter.write(event);
}
//# sourceMappingURL=runner-events-assistant.js.map