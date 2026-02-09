// Event capture for system and result messages

import type { EventWriter } from './event-writer.js';
import {
  buildSystemInitEvent,
  buildSystemStatusEvent,
  buildResultEvent,
  buildErrorEvent,
} from './event-builders-system.js';

interface SystemMessage {
  readonly type: 'system';
  readonly subtype: string;
  readonly status?: string;
  readonly model?: string;
  readonly tools?: readonly unknown[];
  readonly plugins?: readonly unknown[];
}

export async function captureSystemEvent(
  message: SystemMessage,
  eventWriter: EventWriter
): Promise<void> {
  if (message.subtype === 'init') await captureSystemInit(message, eventWriter);
  if (message.subtype === 'status') await captureSystemStatus(message, eventWriter);
}

async function captureSystemInit(message: SystemMessage, eventWriter: EventWriter): Promise<void> {
  const event = buildSystemInitEvent(message);
  await eventWriter.write(event);
}

async function captureSystemStatus(message: SystemMessage, eventWriter: EventWriter): Promise<void> {
  const event = buildSystemStatusEvent(message);
  await eventWriter.write(event);
}

interface ResultMessage {
  readonly type: 'result';
  readonly subtype: string;
  readonly num_turns: number;
  readonly total_cost_usd: number;
  readonly errors: readonly string[];
}

export async function captureResultEvent(
  message: ResultMessage,
  eventWriter: EventWriter
): Promise<void> {
  if (message.subtype === 'success') await captureSuccess(message, eventWriter);
  else await captureError(message, eventWriter);
}

async function captureSuccess(message: ResultMessage, eventWriter: EventWriter): Promise<void> {
  const event = buildResultEvent(message);
  await eventWriter.write(event);
}

async function captureError(message: ResultMessage, eventWriter: EventWriter): Promise<void> {
  const event = buildErrorEvent(message);
  await eventWriter.write(event);
}
