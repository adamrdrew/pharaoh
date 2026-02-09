// Type guards for SDK messages

export function hasType(msg: unknown): msg is { type: string } {
  return typeof msg === 'object' && msg !== null && 'type' in msg && typeof (msg as { type: unknown }).type === 'string';
}

export function isResultMessage(msg: unknown): msg is ResultMessage {
  return hasType(msg) && msg.type === 'result' && hasSubtype(msg);
}

export function isAssistantMessage(msg: unknown): msg is AssistantMessage {
  return hasType(msg) && msg.type === 'assistant' && hasMessageWithContent(msg);
}

export function isToolProgressMessage(msg: unknown): msg is ToolProgressMessage {
  return hasType(msg) && msg.type === 'tool_progress' && hasToolUseId(msg) && hasElapsedTimeSeconds(msg);
}

export function isToolSummaryMessage(msg: unknown): msg is ToolSummaryMessage {
  return hasType(msg) && msg.type === 'tool_use_summary' && hasSummary(msg) && hasPrecedingToolUseIds(msg);
}

export function isSystemMessage(msg: unknown): msg is SystemMessage {
  return hasType(msg) && msg.type === 'system' && hasSubtype(msg);
}

function hasSubtype(msg: unknown): msg is { subtype: string } {
  return typeof msg === 'object' && msg !== null && 'subtype' in msg && typeof (msg as { subtype: unknown }).subtype === 'string';
}

function hasMessageWithContent(msg: unknown): msg is { message: { content: readonly unknown[] } } {
  if (typeof msg !== 'object' || msg === null || !('message' in msg)) return false;
  const inner = (msg as { message: unknown }).message;
  return typeof inner === 'object' && inner !== null && 'content' in inner && Array.isArray((inner as { content: unknown }).content);
}

function hasToolUseId(msg: unknown): msg is { tool_use_id: string } {
  return typeof msg === 'object' && msg !== null && 'tool_use_id' in msg && typeof (msg as { tool_use_id: unknown }).tool_use_id === 'string';
}

function hasElapsedTimeSeconds(msg: unknown): msg is { elapsed_time_seconds: number } {
  return typeof msg === 'object' && msg !== null && 'elapsed_time_seconds' in msg && typeof (msg as { elapsed_time_seconds: unknown }).elapsed_time_seconds === 'number';
}

function hasSummary(msg: unknown): msg is { summary: string } {
  return typeof msg === 'object' && msg !== null && 'summary' in msg && typeof (msg as { summary: unknown }).summary === 'string';
}

function hasPrecedingToolUseIds(msg: unknown): msg is { preceding_tool_use_ids: readonly string[] } {
  return typeof msg === 'object' && msg !== null && 'preceding_tool_use_ids' in msg && Array.isArray((msg as { preceding_tool_use_ids: unknown }).preceding_tool_use_ids);
}

export interface ResultMessage {
  readonly type: 'result';
  readonly subtype: string;
  readonly num_turns?: number;
  readonly total_cost_usd?: number;
  readonly errors?: readonly string[];
}

export interface AssistantMessage {
  readonly type: 'assistant';
  readonly message: {
    readonly content: readonly unknown[];
    readonly usage?: {
      readonly input_tokens: number;
      readonly output_tokens: number;
    };
  };
}

export interface ToolProgressMessage {
  readonly type: 'tool_progress';
  readonly tool_use_id: string;
  readonly tool_name?: string;
  readonly elapsed_time_seconds: number;
}

export interface ToolSummaryMessage {
  readonly type: 'tool_use_summary';
  readonly summary: string;
  readonly preceding_tool_use_ids: readonly string[];
}

export interface SystemMessage {
  readonly type: 'system';
  readonly subtype: string;
  readonly status?: string;
  readonly model?: string;
  readonly tools?: readonly unknown[];
  readonly plugins?: readonly unknown[];
}
