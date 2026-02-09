// Message routing and dispatch for runner
import { handleResultMessage, handleAssistantMessage, handleSystemMessage } from './runner-messages.js';
import { captureAssistantEvents } from './runner-events-assistant.js';
import { captureToolProgressEvent, captureToolSummaryEvent } from './runner-events-tool.js';
import { captureSystemEvent, captureResultEvent } from './runner-events-system.js';
import { isResultMessage, isAssistantMessage, isToolProgressMessage, isToolSummaryMessage, isSystemMessage } from './runner-guards.js';
export async function handleMessage(message, phaseName, startTime, messageCounter, logger, eventWriter, progressDebouncer) {
    if (isResultMessage(message))
        return handleResultMessageWithEvents(message, phaseName, startTime, logger, eventWriter);
    await handleNonResultMessage(message, phaseName, messageCounter, logger, eventWriter, progressDebouncer);
    return null;
}
async function handleResultMessageWithEvents(msg, phaseName, startTime, logger, eventWriter) {
    await captureResultEvent(msg, eventWriter);
    return handleResultMessage(msg, logger, phaseName, startTime);
}
async function handleNonResultMessage(msg, phaseName, messageCounter, logger, eventWriter, progressDebouncer) {
    if (isAssistantMessage(msg))
        await handleAssistantMessageWithEvents(msg, phaseName, messageCounter, logger, eventWriter);
    if (isToolProgressMessage(msg))
        await handleToolProgressMessage(msg, progressDebouncer, eventWriter);
    if (isToolSummaryMessage(msg))
        await handleToolSummaryMessage(msg, eventWriter);
    if (isSystemMessage(msg))
        await handleSystemMessageWithEvents(msg, phaseName, logger, eventWriter);
}
async function handleSystemMessageWithEvents(msg, phaseName, logger, eventWriter) {
    await captureSystemEvent(msg, eventWriter);
    if (msg.subtype === 'status' && typeof msg.status === 'string') {
        await handleSystemMessage(logger, phaseName, msg.status);
    }
}
async function handleAssistantMessageWithEvents(msg, phaseName, messageCounter, logger, eventWriter) {
    await handleAssistantMessage(logger, phaseName, messageCounter + 1);
    await captureAssistantEvents(msg, messageCounter + 1, eventWriter);
}
async function handleToolProgressMessage(msg, progressDebouncer, eventWriter) {
    await captureToolProgressEvent(msg, progressDebouncer, eventWriter);
}
async function handleToolSummaryMessage(msg, eventWriter) {
    await captureToolSummaryEvent(msg, eventWriter);
}
//# sourceMappingURL=runner-routing.js.map