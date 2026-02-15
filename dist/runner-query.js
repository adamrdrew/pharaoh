// SDK query configuration
import { query } from '@anthropic-ai/claude-agent-sdk';
import { resolve } from 'node:path';
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
function isPathAllowed(targetPath, allowedPaths) {
    const normalized = resolve(targetPath);
    return allowedPaths.some(allowed => normalized.startsWith(resolve(allowed)));
}
function checkPathViolation(input, allowedPaths) {
    const toolName = input.tool_name;
    if (!toolName || !input.tool_input)
        return null;
    if (['Read', 'Write', 'Edit'].includes(toolName))
        return checkFilePath(input.tool_input, allowedPaths);
    if (['Glob', 'Grep'].includes(toolName))
        return checkOptionalPath(input.tool_input, allowedPaths);
    return null;
}
function checkFilePath(toolInput, allowedPaths) {
    const filePath = toolInput.file_path;
    if (typeof filePath !== 'string')
        return null;
    return isPathAllowed(filePath, allowedPaths) ? null : filePath;
}
function checkOptionalPath(toolInput, allowedPaths) {
    const path = toolInput.path;
    if (path === undefined)
        return null;
    if (typeof path !== 'string')
        return null;
    return isPathAllowed(path, allowedPaths) ? null : path;
}
async function handlePathViolation(path, allowedPaths, logger, phaseName) {
    await logger.info('Blocked path outside allowed directories', { phase: phaseName, path, allowed: allowedPaths });
    return { continue: true, decision: 'block', reason: `Path "${path}" is outside the permitted directories. Allowed: ${allowedPaths.join(', ')}` };
}
function createBlockHook(allowedPaths, logger, phaseName) {
    return async (input) => {
        const typedInput = input;
        if (isSandboxBypass(typedInput))
            return handleSandboxBypass(logger, phaseName);
        if (isAskUserQuestion(typedInput))
            return handleBlockedQuestion(logger, phaseName);
        const pathViolation = checkPathViolation(typedInput, allowedPaths);
        if (pathViolation)
            return handlePathViolation(pathViolation, allowedPaths, logger, phaseName);
        return { continue: true };
    };
}
function isSandboxBypass(input) {
    return input.tool_name === 'Bash' && input.tool_input?.dangerouslyDisableSandbox === true;
}
async function handleSandboxBypass(logger, phaseName) {
    await logger.info('Blocked dangerouslyDisableSandbox', { phase: phaseName });
    return { continue: true, decision: 'block', reason: 'dangerouslyDisableSandbox is not permitted. Fix the underlying issue instead of disabling the sandbox.' };
}
function isAskUserQuestion(input) {
    return input.hook_event_name === 'PreToolUse' && input.tool_name === 'AskUserQuestion';
}
async function handleBlockedQuestion(logger, phaseName) {
    await logger.info('Blocked AskUserQuestion', { phase: phaseName });
    return { continue: true, decision: 'block', systemMessage: 'Proceed with your best judgement' };
}
//# sourceMappingURL=runner-query.js.map