// Event capture for tool messages
import { buildToolProgressEvent, buildToolSummaryEvent, } from './event-builders-tool.js';
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
//# sourceMappingURL=runner-events-tool.js.map