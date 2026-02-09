// Event capture for SDK messages
import { buildAssistantToolCallEvent, buildAssistantTextEvent, buildAssistantTurnEvent, } from './event-builders-assistant.js';
import { buildToolProgressEvent, buildToolSummaryEvent, } from './event-builders-tool.js';
import { buildSystemInitEvent, buildSystemStatusEvent, buildResultEvent, buildErrorEvent, } from './event-builders-system.js';
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
export async function captureToolProgressEvent(message, debouncer, eventWriter) {
    if (debouncer.shouldWrite(message.tool_use_id)) {
        await writeProgressEvent(message, eventWriter);
        debouncer.markWritten(message.tool_use_id);
    }
}
async function writeProgressEvent(message, eventWriter) {
    const event = buildToolProgressEvent(message);
    await eventWriter.write(event);
}
export async function captureToolSummaryEvent(message, eventWriter) {
    const event = buildToolSummaryEvent(message);
    await eventWriter.write(event);
}
export async function captureSystemEvent(message, eventWriter) {
    if (message.subtype === 'init')
        await captureSystemInit(message, eventWriter);
    if (message.subtype === 'status')
        await captureSystemStatus(message, eventWriter);
}
async function captureSystemInit(message, eventWriter) {
    const event = buildSystemInitEvent(message);
    await eventWriter.write(event);
}
async function captureSystemStatus(message, eventWriter) {
    const event = buildSystemStatusEvent(message);
    await eventWriter.write(event);
}
export async function captureResultEvent(message, eventWriter) {
    if (message.subtype === 'success')
        await captureSuccess(message, eventWriter);
    else
        await captureError(message, eventWriter);
}
async function captureSuccess(message, eventWriter) {
    const event = buildResultEvent(message);
    await eventWriter.write(event);
}
async function captureError(message, eventWriter) {
    const event = buildErrorEvent(message);
    await eventWriter.write(event);
}
//# sourceMappingURL=runner-events.js.map