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
    lock;
    pluginPath;
    progressDebouncer;
    statusThrottler;
    constructor(logger, status, config, eventWriter, filesystem, lock) {
        this.logger = logger;
        this.status = status;
        this.config = config;
        this.eventWriter = eventWriter;
        this.filesystem = filesystem;
        this.lock = lock;
        this.pluginPath = resolvePluginPath();
        this.progressDebouncer = new ProgressDebouncer(5000);
        this.statusThrottler = new StatusThrottler(5000);
    }
    async runPhase(pid, started, phasePrompt, phaseName, gitBranch, metadata, phasesCompleted) {
        const name = phaseName ?? 'unnamed-phase';
        const phaseStarted = new Date().toISOString();
        const startTime = Date.now();
        await this.initializePhase(pid, started, name, phaseStarted, gitBranch, metadata, phasesCompleted);
        const q = createQuery(this.config, this.pluginPath, this.logger, phasePrompt, name);
        const context = { pid, started, phase: name, phaseStarted, gitBranch, metadata, phasesCompleted };
        const sdkResult = await this.processQueryMessages(q, name, startTime, context);
        return verifyPhaseCompletion(sdkResult, name, this.config.cwd, this.filesystem, this.logger);
    }
    async initializePhase(pid, started, phaseName, phaseStarted, gitBranch, metadata, phasesCompleted) {
        await this.eventWriter.clear();
        await this.logger.info('Starting phase execution', { phase: phaseName });
        const busyInput = { pid, started, phase: phaseName, phaseStarted, turnsElapsed: 0, runningCostUsd: 0, ...metadata, gitBranch: gitBranch ?? '', phasesCompleted };
        await this.status.setBusy(busyInput);
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
        const lockValid = await this.validateLockPeriodically(state.turns);
        if (!lockValid)
            return this.buildLockFailureResult(phaseName, state, startTime);
        await this.updateStatusIfNeeded(state, context);
        return null;
    }
    async validateLockPeriodically(turns) {
        if (turns % 10 !== 0)
            return true;
        return this.lock.validate();
    }
    buildLockFailureResult(phaseName, state, startTime) {
        this.logger.error('Lock validation failed during phase execution', { phase: phaseName, turns: state.turns });
        return { ok: false, reason: 'blocked', error: 'Lock stolen during execution', costUsd: state.costUsd, turns: state.turns, durationMs: Date.now() - startTime };
    }
    async updateStatusIfNeeded(state, context) {
        if (this.statusThrottler.shouldWrite()) {
            await this.updateStatusWithMetrics(state, context);
        }
    }
    async updateStatusWithMetrics(state, context) {
        const { gitBranch, metadata, phasesCompleted, ...baseContext } = context;
        await this.status.setBusy({ ...baseContext, turnsElapsed: state.turnsElapsed, runningCostUsd: state.runningCostUsd, ...metadata, gitBranch: gitBranch ?? '', phasesCompleted });
    }
}
//# sourceMappingURL=runner.js.map