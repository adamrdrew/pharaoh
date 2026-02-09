// Runner state management

import { calculateRunningCost } from './cost-calculator.js';
import { isAssistantMessage, isResultMessage, type AssistantMessage, type ResultMessage } from './runner-guards.js';

export interface RunnerState {
  turns: number;
  costUsd: number;
  messageCounter: number;
  inputTokens: number;
  outputTokens: number;
  turnsElapsed: number;
  runningCostUsd: number;
}

export interface PhaseContext {
  readonly pid: number;
  readonly started: string;
  readonly phase: string;
  readonly phaseStarted: string;
}

export function updateState(message: unknown, state: RunnerState): void {
  if (isAssistantMessage(message)) updateAssistantMetrics(message, state);
  if (isResultMessage(message)) updateResultMetrics(message, state);
}

function updateAssistantMetrics(msg: AssistantMessage, state: RunnerState): void {
  state.messageCounter++;
  state.turnsElapsed = state.messageCounter;
  accumulateTokens(msg.message.usage, state);
}

function accumulateTokens(usage: { input_tokens: number; output_tokens: number } | undefined, state: RunnerState): void {
  if (usage) {
    state.inputTokens += usage.input_tokens;
    state.outputTokens += usage.output_tokens;
    state.runningCostUsd = calculateRunningCost(state.inputTokens, state.outputTokens);
  }
}

function updateResultMetrics(msg: ResultMessage, state: RunnerState): void {
  if (msg.num_turns !== undefined && msg.total_cost_usd !== undefined) {
    state.turns = msg.num_turns;
    state.costUsd = msg.total_cost_usd;
  }
}
