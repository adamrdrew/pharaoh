// SDK query runner for executing phases via ir-kat skill

import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import { createQuery } from './runner-query.js';
import { handleResultMessage, handleAssistantMessage, handleSystemMessage } from './runner-messages.js';
import { buildNoResultError } from './runner-results.js';
import { resolvePluginPath } from './plugin-resolver.js';
import { verifyPhaseCompletion } from './runner-verification.js';

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

  constructor(
    private readonly logger: Logger,
    private readonly status: StatusManager,
    private readonly config: RunnerConfig
  ) {
    this.pluginPath = resolvePluginPath();
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
    const sdkResult = await this.processQueryMessages(q, name, startTime);
    return verifyPhaseCompletion(sdkResult, name, this.config.cwd, this.pluginPath, this.logger);
  }

  private async initializePhase(
    pid: number,
    started: string,
    phaseName: string,
    phaseStarted: string
  ): Promise<void> {
    await this.logger.info('Starting phase execution', { phase: phaseName });
    await this.status.setBusy({ pid, started, phase: phaseName, phaseStarted });
  }

  private async processQueryMessages(q: ReturnType<typeof createQuery>, phaseName: string, startTime: number): Promise<PhaseResult> {
    const state = { turns: 0, costUsd: 0, messageCounter: 0 };
    for await (const message of q) {
      const result = await this.processMessage(message, phaseName, startTime, state);
      if (result) return result;
    }
    return buildNoResultError(this.logger, phaseName, state.costUsd, state.turns, Date.now() - startTime);
  }

  private async processMessage(message: unknown, phaseName: string, startTime: number, state: { turns: number; costUsd: number; messageCounter: number }): Promise<PhaseResult | null> {
    const result = await this.handleMessage(message, phaseName, startTime, state.messageCounter);
    if (result) return result;
    this.updateState(message, state);
    return null;
  }

  private updateState(message: unknown, state: { turns: number; costUsd: number; messageCounter: number }): void {
    const msg = message as { type: string; num_turns?: number; total_cost_usd?: number };
    if (msg.type === 'assistant') state.messageCounter++;
    if (msg.type === 'result') this.updateResultMetrics(msg, state);
  }

  private updateResultMetrics(msg: { num_turns?: number; total_cost_usd?: number }, state: { turns: number; costUsd: number }): void {
    if (msg.num_turns !== undefined && msg.total_cost_usd !== undefined) {
      state.turns = msg.num_turns;
      state.costUsd = msg.total_cost_usd;
    }
  }

  private async handleMessage(message: unknown, phaseName: string, startTime: number, messageCounter: number): Promise<PhaseResult | null> {
    const msg = message as { type: string; subtype?: string; status?: unknown };
    if (msg.type === 'result') return handleResultMessage(msg as Parameters<typeof handleResultMessage>[0], this.logger, phaseName, startTime);
    await this.handleNonResultMessage(msg, phaseName, messageCounter);
    return null;
  }

  private async handleNonResultMessage(msg: { type: string; subtype?: string; status?: unknown }, phaseName: string, messageCounter: number): Promise<void> {
    if (msg.type === 'assistant') await handleAssistantMessage(this.logger, phaseName, messageCounter + 1);
    if (msg.type === 'system' && msg.subtype === 'status' && typeof msg.status === 'string') await handleSystemMessage(this.logger, phaseName, msg.status);
  }
}
