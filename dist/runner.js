// SDK query runner for executing phases via ir-kat skill
import { createQuery } from './runner-query.js';
import { buildNoResultError } from './runner-results.js';
import { resolvePluginPath } from './plugin-resolver.js';
import { verifyPhaseCompletion } from './runner-verification.js';
import { ProgressDebouncer } from './event-debouncer.js';
import { StatusThrottler } from './status-throttler.js';
import { updateState } from './runner-state.js';
import { handleMessage } from './runner-routing.js';
/**
 * Executes phases via the Claude Agent SDK
 */
export class PhaseRunner {
    logger;
    status;
    config;
    eventWriter;
    filesystem;
    pluginPath;
    progressDebouncer;
    statusThrottler;
    constructor(logger, status, config, eventWriter, filesystem) {
        this.logger = logger;
        this.status = status;
        this.config = config;
        this.eventWriter = eventWriter;
        this.filesystem = filesystem;
        this.pluginPath = resolvePluginPath();
        this.progressDebouncer = new ProgressDebouncer(5000);
        this.statusThrottler = new StatusThrottler(5000);
    }
    async runPhase(pid, started, phasePrompt, phaseName) {
        const name = phaseName ?? 'unnamed-phase';
        const phaseStarted = new Date().toISOString();
        const startTime = Date.now();
        await this.initializePhase(pid, started, name, phaseStarted);
        const q = createQuery(this.config, this.pluginPath, this.logger, phasePrompt, name);
        const context = { pid, started, phase: name, phaseStarted };
        const sdkResult = await this.processQueryMessages(q, name, startTime, context);
        return verifyPhaseCompletion(sdkResult, name, this.config.cwd, this.filesystem, this.logger);
    }
    async initializePhase(pid, started, phaseName, phaseStarted) {
        await this.eventWriter.clear();
        await this.logger.info('Starting phase execution', { phase: phaseName });
        await this.status.setBusy({ pid, started, phase: phaseName, phaseStarted, turnsElapsed: 0, runningCostUsd: 0 });
    }
    async processQueryMessages(q, phaseName, startTime, context) {
        const state = { turns: 0, costUsd: 0, messageCounter: 0, inputTokens: 0, outputTokens: 0, turnsElapsed: 0, runningCostUsd: 0 };
        for await (const message of q) {
            const result = await this.processMessage(message, phaseName, startTime, state, context);
            if (result)
                return result;
        }
        return buildNoResultError(this.logger, phaseName, state.costUsd, state.turns, Date.now() - startTime);
    }
    async processMessage(message, phaseName, startTime, state, context) {
        const result = await handleMessage(message, phaseName, startTime, state.messageCounter, this.logger, this.eventWriter, this.progressDebouncer);
        if (result)
            return result;
        updateState(message, state);
        await this.updateStatusIfNeeded(state, context);
        return null;
    }
    async updateStatusIfNeeded(state, context) {
        if (this.statusThrottler.shouldWrite()) {
            await this.updateStatusWithMetrics(state, context);
        }
    }
    async updateStatusWithMetrics(state, context) {
        await this.status.setBusy({ ...context, turnsElapsed: state.turnsElapsed, runningCostUsd: state.runningCostUsd });
    }
}
//# sourceMappingURL=runner.js.map