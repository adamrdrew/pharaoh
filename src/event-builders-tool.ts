// Event builders for tool messages

import type { PharaohEvent } from './event-writer.js';
import { timestamp } from './event-builders-utils.js';

interface ToolProgressMessage {
  readonly type: 'tool_progress';
  readonly tool_use_id: string;
  readonly elapsed_millis: number;
}

interface ToolSummaryMessage {
  readonly type: 'tool_use_summary';
  readonly summary: string;
  readonly tool_use_ids: readonly string[];
}

export function buildToolProgressEvent(message: ToolProgressMessage): PharaohEvent {
  return { timestamp: timestamp(), type: 'tool_progress', summary: `Progress: ${message.elapsed_millis}ms`, detail: { tool_use_id: message.tool_use_id, elapsed_millis: message.elapsed_millis } };
}

export function buildToolSummaryEvent(message: ToolSummaryMessage): PharaohEvent {
  return createToolSummaryEvent(message.summary, message.tool_use_ids);
}

function createToolSummaryEvent(summary: string, toolUseIds: readonly string[]): PharaohEvent {
  return { timestamp: timestamp(), type: 'tool_summary', summary, detail: { tool_use_ids: toolUseIds } };
}
