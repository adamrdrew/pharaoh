// Event capture for system and result messages
import { buildSystemInitEvent, buildSystemStatusEvent, buildResultEvent, buildErrorEvent, } from './event-builders-system.js';
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
//# sourceMappingURL=runner-events-system.js.map