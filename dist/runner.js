// SDK query runner for executing phases via ir-kat skill
import { createQuery } from './runner-query.js';
import { handleResultMessage, handleAssistantMessage, handleSystemMessage } from './runner-messages.js';
import { buildNoResultError } from './runner-results.js';
import { resolvePluginPath } from './plugin-resolver.js';
import { verifyPhaseCompletion } from './runner-verification.js';
/**
 * Executes phases via the Claude Agent SDK
 */
export class PhaseRunner {
    logger;
    status;
    config;
    pluginPath;
    constructor(logger, status, config) {
        this.logger = logger;
        this.status = status;
        this.config = config;
        this.pluginPath = resolvePluginPath();
    }
    async runPhase(pid, started, phasePrompt, phaseName) {
        const name = phaseName ?? 'unnamed-phase';
        const phaseStarted = new Date().toISOString();
        const startTime = Date.now();
        await this.initializePhase(pid, started, name, phaseStarted);
        const q = createQuery(this.config, this.pluginPath, this.logger, phasePrompt, name);
        const sdkResult = await this.processQueryMessages(q, name, startTime);
        return verifyPhaseCompletion(sdkResult, name, this.config.cwd, this.pluginPath, this.logger);
    }
    async initializePhase(pid, started, phaseName, phaseStarted) {
        await this.logger.info('Starting phase execution', { phase: phaseName });
        await this.status.setBusy({ pid, started, phase: phaseName, phaseStarted });
    }
    async processQueryMessages(q, phaseName, startTime) {
        const state = { turns: 0, costUsd: 0, messageCounter: 0 };
        for await (const message of q) {
            const result = await this.processMessage(message, phaseName, startTime, state);
            if (result)
                return result;
        }
        return buildNoResultError(this.logger, phaseName, state.costUsd, state.turns, Date.now() - startTime);
    }
    async processMessage(message, phaseName, startTime, state) {
        const result = await this.handleMessage(message, phaseName, startTime, state.messageCounter);
        if (result)
            return result;
        this.updateState(message, state);
        return null;
    }
    updateState(message, state) {
        const msg = message;
        if (msg.type === 'assistant')
            state.messageCounter++;
        if (msg.type === 'result')
            this.updateResultMetrics(msg, state);
    }
    updateResultMetrics(msg, state) {
        if (msg.num_turns !== undefined && msg.total_cost_usd !== undefined) {
            state.turns = msg.num_turns;
            state.costUsd = msg.total_cost_usd;
        }
    }
    async handleMessage(message, phaseName, startTime, messageCounter) {
        const msg = message;
        if (msg.type === 'result')
            return handleResultMessage(msg, this.logger, phaseName, startTime);
        await this.handleNonResultMessage(msg, phaseName, messageCounter);
        return null;
    }
    async handleNonResultMessage(msg, phaseName, messageCounter) {
        if (msg.type === 'assistant')
            await handleAssistantMessage(this.logger, phaseName, messageCounter + 1);
        if (msg.type === 'system' && msg.subtype === 'status' && typeof msg.status === 'string')
            await handleSystemMessage(this.logger, phaseName, msg.status);
    }
}
//# sourceMappingURL=runner.js.map