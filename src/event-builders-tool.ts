// Event builders for tool messages

import type { PharaohEvent } from './event-writer.js';
import { timestamp } from './event-builders-utils.js';

interface ToolProgressMessage {
  readonly type: 'tool_progress';
  readonly tool_use_id: string;
  readonly tool_name?: string;
  readonly elapsed_time_seconds: number;
}

interface ToolSummaryMessage {
  readonly type: 'tool_use_summary';
  readonly summary: string;
  readonly preceding_tool_use_ids: readonly string[];
}

export function buildToolProgressEvent(message: ToolProgressMessage): PharaohEvent {
  const label = message.tool_name ?? message.tool_use_id;
  return { timestamp: timestamp(), type: 'tool_progress', summary: `${label}: ${message.elapsed_time_seconds}s`, detail: { tool_use_id: message.tool_use_id, tool_name: message.tool_name, elapsed_seconds: message.elapsed_time_seconds } };
}

export function buildToolSummaryEvent(message: ToolSummaryMessage): PharaohEvent {
  return createToolSummaryEvent(message.summary, message.preceding_tool_use_ids);
}

function createToolSummaryEvent(summary: string, toolUseIds: readonly string[]): PharaohEvent {
  return { timestamp: timestamp(), type: 'tool_summary', summary, detail: { preceding_tool_use_ids: toolUseIds } };
}
