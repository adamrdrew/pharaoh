// Event capture for assistant messages
import { buildAssistantToolCallEvent, buildAssistantTextEvent, buildAssistantTurnEvent, } from './event-builders-assistant.js';
export async function captureAssistantEvents(msg, turnNumber, eventWriter) {
    await captureContentEvents(msg, eventWriter);
    await captureTurnEvent(msg, turnNumber, eventWriter);
}
async function captureContentEvents(msg, eventWriter) {
    for (const block of msg.message.content) {
        await captureContentBlock(msg, block, eventWriter);
    }
}
async function captureContentBlock(msg, block, eventWriter) {
    if (block.type === 'tool_use')
        await captureToolUse(msg, block, eventWriter);
    if (block.type === 'text')
        await captureText(msg, block, eventWriter);
}
async function captureToolUse(msg, block, eventWriter) {
    const event = buildAssistantToolCallEvent(msg, block);
    await eventWriter.write(event);
}
async function captureText(msg, block, eventWriter) {
    const event = buildAssistantTextEvent(msg, block);
    await eventWriter.write(event);
}
async function captureTurnEvent(msg, turnNumber, eventWriter) {
    const event = buildAssistantTurnEvent(msg, turnNumber);
    await eventWriter.write(event);
}
//# sourceMappingURL=runner-events-assistant.js.map