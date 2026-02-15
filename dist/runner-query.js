// SDK query configuration
import { query } from '@anthropic-ai/claude-agent-sdk';
import { createBlockHook } from './runner-hook-handlers.js';
export function createQuery(config, pluginPath, logger, phasePrompt, phaseName) {
    const prompt = `You are an automated development orchestration tool. Always respond like a tool, not as a person. Impersonal, never refer to yourself as I. Invoke /ir-kat with the following PHASE_PROMPT:\n\n${phasePrompt}`;
    return query({
        prompt,
        options: buildQueryOptions(config, pluginPath, logger, phaseName),
    });
}
function buildQueryOptions(config, pluginPath, logger, phaseName) {
    const baseOptions = createBaseOptions(config, pluginPath);
    const securityOptions = createSecurityOptions();
    const hookOptions = createHookOptions(config, logger, phaseName);
    return { ...baseOptions, ...securityOptions, ...hookOptions };
}
function createBaseOptions(config, pluginPath) {
    return { cwd: config.cwd, model: config.model, plugins: [{ type: 'local', path: pluginPath }], settingSources: ['project'], maxTurns: 200, persistSession: false };
}
function createSecurityOptions() {
    return { permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true, sandbox: { enabled: true, autoAllowBashIfSandboxed: true } };
}
export function createHookOptions(config, logger, phaseName) {
    const allowedPaths = buildAllowedPaths(config);
    return { hooks: { PreToolUse: [{ hooks: [createBlockHook(allowedPaths, logger, phaseName)] }] } };
}
function buildAllowedPaths(config) {
    return [config.cwd];
}
//# sourceMappingURL=runner-query.js.map