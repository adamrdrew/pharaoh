// SDK query runner for executing phases via ir-kat skill

import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import { createQuery } from './runner-query.js';
import { handleResultMessage, handleAssistantMessage, handleSystemMessage } from './runner-messages.js';
import { buildNoResultError } from './runner-results.js';

/**
 * Configuration for phase execution
 */
export interface RunnerConfig {
  readonly cwd: string;
  readonly pluginPath: string;
  readonly model: string;
}

/**
 * Executes phases via the Claude Agent SDK
 */
export class PhaseRunner {
  constructor(
    private readonly logger: Logger,
    private readonly status: StatusManager,
    private readonly config: RunnerConfig
  ) {}

  async runPhase(
    pid: number,
    started: string,
    phasePrompt: string,
    phaseName?: string
  ): Promise<PhaseResult> {
    const name = phaseName ?? 'unnamed-phase';
    const startTime = Date.now();
    await this.initializePhase(pid, started, name);
    const q = createQuery(this.config, this.logger, phasePrompt, name);
    return this.processQueryMessages(q, name, startTime);
  }

  private async initializePhase(
    pid: number,
    started: string,
    phaseName: string
  ): Promise<void> {
    await this.logger.info('Starting phase execution', { phase: phaseName });
    await this.status.setBusy({ pid, started, phase: phaseName, phaseStarted: new Date().toISOString() });
  }

  private async processQueryMessages(q: ReturnType<typeof createQuery>, phaseName: string, startTime: number): Promise<PhaseResult> {
    const state = { turns: 0, costUsd: 0, turnCounter: 0 };
    for await (const message of q) {
      const result = await this.processMessage(message, phaseName, startTime, state);
      if (result) return result;
    }
    return buildNoResultError(this.logger, phaseName, state.costUsd, state.turns, Date.now() - startTime);
  }

  private async processMessage(message: unknown, phaseName: string, startTime: number, state: { turns: number; costUsd: number; turnCounter: number }): Promise<PhaseResult | null> {
    const result = await this.handleMessage(message, phaseName, startTime, state.turnCounter);
    if (result) return result;
    this.updateState(message, state);
    return null;
  }

  private updateState(message: unknown, state: { turns: number; costUsd: number; turnCounter: number }): void {
    const msg = message as { type: string; num_turns?: number; total_cost_usd?: number };
    if (msg.type === 'assistant') state.turnCounter++;
    if (msg.type === 'result' && msg.num_turns !== undefined && msg.total_cost_usd !== undefined) {
      state.turns = msg.num_turns;
      state.costUsd = msg.total_cost_usd;
    }
  }

  private async handleMessage(message: unknown, phaseName: string, startTime: number, turnCounter: number): Promise<PhaseResult | null> {
    const msg = message as { type: string; subtype?: string; status?: unknown };
    if (msg.type === 'result') return handleResultMessage(msg as Parameters<typeof handleResultMessage>[0], this.logger, phaseName, startTime);
    await this.handleNonResultMessage(msg, phaseName, turnCounter);
    return null;
  }

  private async handleNonResultMessage(msg: { type: string; subtype?: string; status?: unknown }, phaseName: string, turnCounter: number): Promise<void> {
    if (msg.type === 'assistant') await handleAssistantMessage(this.logger, phaseName, turnCounter + 1);
    if (msg.type === 'system' && msg.subtype === 'status' && typeof msg.status === 'string') await handleSystemMessage(this.logger, phaseName, msg.status);
  }
}
