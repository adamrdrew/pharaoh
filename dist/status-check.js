// Phase status verification via SDK query
import { query } from '@anthropic-ai/claude-agent-sdk';
export async function checkPhaseStatus(cwd, pluginPath, logger) {
    try {
        const result = await executeStatusQuery(cwd, pluginPath);
        const status = extractPhaseStatus(result);
        return { ok: true, status };
    }
    catch (err) {
        return buildErrorResult(logger, err);
    }
}
async function executeStatusQuery(cwd, pluginPath) {
    let output = '';
    const q = query({ prompt: '/phase-status latest', options: buildQueryOptions(cwd, pluginPath) });
    for await (const message of q) {
        output += extractMessageContent(message);
    }
    return output;
}
function buildQueryOptions(cwd, pluginPath) {
    return { cwd, model: 'claude-sonnet-4-20250514', plugins: [{ type: 'local', path: pluginPath }], settingSources: ['project'], maxTurns: 5, persistSession: false };
}
function extractMessageContent(message) {
    const msg = message;
    return msg.type === 'assistant' && typeof msg.content === 'string' ? msg.content : '';
}
function extractPhaseStatus(output) {
    const statusMatch = output.match(/"status":\s*"([^"]+)"/);
    return statusMatch?.[1] ?? 'unknown';
}
async function buildErrorResult(logger, err) {
    await logger.warn('Phase status check failed', { error: String(err) });
    return { ok: false, error: String(err) };
}
//# sourceMappingURL=status-check.js.map