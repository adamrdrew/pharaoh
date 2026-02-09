// Event capture for tool messages

import type { EventWriter } from './event-writer.js';
import type { ProgressDebouncer } from './event-debouncer.js';
import {
  buildToolProgressEvent,
  buildToolSummaryEvent,
} from './event-builders-tool.js';

interface ToolProgressMessage {
  readonly type: 'tool_progress';
  readonly tool_use_id: string;
  readonly tool_name?: string;
  readonly elapsed_time_seconds: number;
}

export async function captureToolProgressEvent(
  message: ToolProgressMessage,
  debouncer: ProgressDebouncer,
  eventWriter: EventWriter
): Promise<void> {
  if (debouncer.shouldWrite(message.tool_use_id)) {
    await writeProgressEvent(message, eventWriter);
    debouncer.markWritten(message.tool_use_id);
  }
}

async function writeProgressEvent(message: ToolProgressMessage, eventWriter: EventWriter): Promise<void> {
  const event = buildToolProgressEvent(message);
  await eventWriter.write(event);
}

interface ToolSummaryMessage {
  readonly type: 'tool_use_summary';
  readonly summary: string;
  readonly preceding_tool_use_ids: readonly string[];
}

export async function captureToolSummaryEvent(
  message: ToolSummaryMessage,
  eventWriter: EventWriter
): Promise<void> {
  const event = buildToolSummaryEvent(message);
  await eventWriter.write(event);
}
