// Event builders for system and result messages

import type { PharaohEvent } from './event-writer.js';
import { truncate, timestamp } from './event-builders-utils.js';

interface SystemMessage {
  readonly type: 'system';
  readonly subtype: string;
  readonly status?: string;
  readonly model?: string;
  readonly tools?: readonly unknown[];
  readonly plugins?: readonly unknown[];
}

interface ResultMessage {
  readonly type: 'result';
  readonly subtype: string;
  readonly num_turns: number;
  readonly total_cost_usd: number;
  readonly errors: readonly string[];
}

export function buildSystemInitEvent(message: SystemMessage): PharaohEvent {
  return createSystemInitEvent(message.model, message.tools, message.plugins);
}

function createSystemInitEvent(model?: string, tools?: readonly unknown[], plugins?: readonly unknown[]): PharaohEvent {
  return { timestamp: timestamp(), type: 'status', summary: 'SDK initialized', detail: { model, tools_count: tools?.length, plugins_count: plugins?.length } };
}

export function buildSystemStatusEvent(message: SystemMessage): PharaohEvent {
  return { timestamp: timestamp(), type: 'status', summary: message.status ?? 'Status update', detail: { status: message.status } };
}

export function buildResultEvent(message: ResultMessage): PharaohEvent {
  return createResultEvent(message.num_turns, message.total_cost_usd);
}

function createResultEvent(turns: number, costUsd: number): PharaohEvent {
  return { timestamp: timestamp(), type: 'result', summary: `Phase complete: ${turns} turns, $${costUsd.toFixed(2)}`, detail: { turns, cost_usd: costUsd } };
}

export function buildErrorEvent(message: ResultMessage): PharaohEvent {
  return createErrorEvent(message.errors, message.num_turns, message.total_cost_usd);
}

function createErrorEvent(errors: readonly string[], turns: number, costUsd: number): PharaohEvent {
  const errorSummary = errors.join('; ');
  return { timestamp: timestamp(), type: 'error', summary: truncate(errorSummary, 200), detail: { errors, turns, cost_usd: costUsd } };
}
