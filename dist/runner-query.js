// SDK query configuration
import { query } from '@anthropic-ai/claude-agent-sdk';
export function createQuery(config, logger, phasePrompt, phaseName) {
    const prompt = `Invoke /ir-kat with the following PHASE_PROMPT:\n\n${phasePrompt}`;
    return query({
        prompt,
        options: buildQueryOptions(config, logger, phaseName),
    });
}
function buildQueryOptions(config, logger, phaseName) {
    const baseOptions = createBaseOptions(config);
    const securityOptions = createSecurityOptions();
    const hookOptions = createHookOptions(logger, phaseName);
    return { ...baseOptions, ...securityOptions, ...hookOptions };
}
function createBaseOptions(config) {
    return { cwd: config.cwd, model: config.model, plugins: [{ type: 'local', path: config.pluginPath }], settingSources: ['project'], maxTurns: 200, persistSession: false };
}
function createSecurityOptions() {
    return { permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true, sandbox: { enabled: true, autoAllowBashIfSandboxed: true } };
}
function createHookOptions(logger, phaseName) {
    return { hooks: { PreToolUse: [{ hooks: [createBlockHook(logger, phaseName)] }] } };
}
function createBlockHook(logger, phaseName) {
    return async (input) => {
        const typedInput = input;
        if (isAskUserQuestion(typedInput))
            return handleBlockedQuestion(logger, phaseName);
        return { continue: true };
    };
}
function isAskUserQuestion(input) {
    return input.hook_event_name === 'PreToolUse' && input.tool_name === 'AskUserQuestion';
}
async function handleBlockedQuestion(logger, phaseName) {
    await logger.info('Blocked AskUserQuestion', { phase: phaseName });
    return { continue: true, decision: 'block', systemMessage: 'Proceed with your best judgement' };
}
//# sourceMappingURL=runner-query.js.map