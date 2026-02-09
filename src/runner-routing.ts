// Message routing and dispatch for runner

import type { Logger } from './log.js';
import type { PhaseResult } from './types.js';
import type { EventWriter } from './event-writer.js';
import type { ProgressDebouncer } from './event-debouncer.js';
import { handleResultMessage, handleAssistantMessage, handleSystemMessage } from './runner-messages.js';
import { captureAssistantEvents } from './runner-events-assistant.js';
import { captureToolProgressEvent, captureToolSummaryEvent } from './runner-events-tool.js';
import { captureSystemEvent, captureResultEvent } from './runner-events-system.js';
import { isResultMessage, isAssistantMessage, isToolProgressMessage, isToolSummaryMessage, isSystemMessage, type ResultMessage, type AssistantMessage, type ToolProgressMessage, type ToolSummaryMessage, type SystemMessage } from './runner-guards.js';

export async function handleMessage(
  message: unknown,
  phaseName: string,
  startTime: number,
  messageCounter: number,
  logger: Logger,
  eventWriter: EventWriter,
  progressDebouncer: ProgressDebouncer
): Promise<PhaseResult | null> {
  if (isResultMessage(message)) return handleResultMessageWithEvents(message, phaseName, startTime, logger, eventWriter);
  await handleNonResultMessage(message, phaseName, messageCounter, logger, eventWriter, progressDebouncer);
  return null;
}

async function handleResultMessageWithEvents(msg: ResultMessage, phaseName: string, startTime: number, logger: Logger, eventWriter: EventWriter): Promise<PhaseResult> {
  await captureResultEvent(msg as Parameters<typeof captureResultEvent>[0], eventWriter);
  return handleResultMessage(msg as Parameters<typeof handleResultMessage>[0], logger, phaseName, startTime);
}

async function handleNonResultMessage(msg: unknown, phaseName: string, messageCounter: number, logger: Logger, eventWriter: EventWriter, progressDebouncer: ProgressDebouncer): Promise<void> {
  if (isAssistantMessage(msg)) await handleAssistantMessageWithEvents(msg, phaseName, messageCounter, logger, eventWriter);
  if (isToolProgressMessage(msg)) await handleToolProgressMessage(msg, progressDebouncer, eventWriter);
  if (isToolSummaryMessage(msg)) await handleToolSummaryMessage(msg, eventWriter);
  if (isSystemMessage(msg)) await handleSystemMessageWithEvents(msg, phaseName, logger, eventWriter);
}

async function handleSystemMessageWithEvents(msg: SystemMessage, phaseName: string, logger: Logger, eventWriter: EventWriter): Promise<void> {
  await captureSystemEvent(msg as Parameters<typeof captureSystemEvent>[0], eventWriter);
  if (msg.subtype === 'status' && typeof msg.status === 'string') {
    await handleSystemMessage(logger, phaseName, msg.status);
  }
}

async function handleAssistantMessageWithEvents(msg: AssistantMessage, phaseName: string, messageCounter: number, logger: Logger, eventWriter: EventWriter): Promise<void> {
  await handleAssistantMessage(logger, phaseName, messageCounter + 1);
  await captureAssistantEvents(msg as Parameters<typeof captureAssistantEvents>[0], messageCounter + 1, eventWriter);
}

async function handleToolProgressMessage(msg: ToolProgressMessage, progressDebouncer: ProgressDebouncer, eventWriter: EventWriter): Promise<void> {
  await captureToolProgressEvent(msg as Parameters<typeof captureToolProgressEvent>[0], progressDebouncer, eventWriter);
}

async function handleToolSummaryMessage(msg: ToolSummaryMessage, eventWriter: EventWriter): Promise<void> {
  await captureToolSummaryEvent(msg as Parameters<typeof captureToolSummaryEvent>[0], eventWriter);
}
