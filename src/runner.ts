// SDK query runner for executing phases via ir-kat skill

import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { EventWriter } from './event-writer.js';
import { createQuery } from './runner-query.js';
import { buildNoResultError } from './runner-results.js';
import { resolvePluginPath } from './plugin-resolver.js';
import { verifyPhaseCompletion } from './runner-verification.js';
import { ProgressDebouncer } from './event-debouncer.js';
import { StatusThrottler } from './status-throttler.js';
import { updateState, type RunnerState, type PhaseContext } from './runner-state.js';
import { handleMessage } from './runner-routing.js';

/**
 * Configuration for phase execution
 */
export interface RunnerConfig {
  readonly cwd: string;
  readonly model: string;
}

/**
 * Executes phases via the Claude Agent SDK
 */
export class PhaseRunner {
  private readonly pluginPath: string;
  private readonly progressDebouncer: ProgressDebouncer;
  private readonly statusThrottler: StatusThrottler;

  constructor(
    private readonly logger: Logger,
    private readonly status: StatusManager,
    private readonly config: RunnerConfig,
    private readonly eventWriter: EventWriter
  ) {
    this.pluginPath = resolvePluginPath();
    this.progressDebouncer = new ProgressDebouncer(5000);
    this.statusThrottler = new StatusThrottler(5000);
  }

  async runPhase(
    pid: number,
    started: string,
    phasePrompt: string,
    phaseName?: string
  ): Promise<PhaseResult> {
    const name = phaseName ?? 'unnamed-phase';
    const phaseStarted = new Date().toISOString();
    const startTime = Date.now();
    await this.initializePhase(pid, started, name, phaseStarted);
    const q = createQuery(this.config, this.pluginPath, this.logger, phasePrompt, name);
    const context = { pid, started, phase: name, phaseStarted };
    const sdkResult = await this.processQueryMessages(q, name, startTime, context);
    return verifyPhaseCompletion(sdkResult, name, this.config.cwd, this.pluginPath, this.logger);
  }

  private async initializePhase(
    pid: number,
    started: string,
    phaseName: string,
    phaseStarted: string
  ): Promise<void> {
    await this.eventWriter.clear();
    await this.logger.info('Starting phase execution', { phase: phaseName });
    await this.status.setBusy({ pid, started, phase: phaseName, phaseStarted, turnsElapsed: 0, runningCostUsd: 0 });
  }

  private async processQueryMessages(q: ReturnType<typeof createQuery>, phaseName: string, startTime: number, context: PhaseContext): Promise<PhaseResult> {
    const state = { turns: 0, costUsd: 0, messageCounter: 0, inputTokens: 0, outputTokens: 0, turnsElapsed: 0, runningCostUsd: 0 };
    for await (const message of q) {
      const result = await this.processMessage(message, phaseName, startTime, state, context);
      if (result) return result;
    }
    return buildNoResultError(this.logger, phaseName, state.costUsd, state.turns, Date.now() - startTime);
  }

  private async processMessage(message: unknown, phaseName: string, startTime: number, state: RunnerState, context: PhaseContext): Promise<PhaseResult | null> {
    const result = await handleMessage(message, phaseName, startTime, state.messageCounter, this.logger, this.eventWriter, this.progressDebouncer);
    if (result) return result;
    updateState(message, state);
    await this.updateStatusIfNeeded(state, context);
    return null;
  }

  private async updateStatusIfNeeded(state: RunnerState, context: PhaseContext): Promise<void> {
    if (this.statusThrottler.shouldWrite()) {
      await this.updateStatusWithMetrics(state, context);
    }
  }

  private async updateStatusWithMetrics(state: RunnerState, context: PhaseContext): Promise<void> {
    await this.status.setBusy({ ...context, turnsElapsed: state.turnsElapsed, runningCostUsd: state.runningCostUsd });
  }
}
