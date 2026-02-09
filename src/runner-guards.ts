// Type guards for SDK messages

export function hasType(msg: unknown): msg is { type: string } {
  return typeof msg === 'object' && msg !== null && 'type' in msg && typeof (msg as { type: unknown }).type === 'string';
}

export function isResultMessage(msg: unknown): msg is ResultMessage {
  return hasType(msg) && msg.type === 'result' && hasSubtype(msg);
}

export function isAssistantMessage(msg: unknown): msg is AssistantMessage {
  return hasType(msg) && msg.type === 'assistant' && hasContent(msg);
}

export function isToolProgressMessage(msg: unknown): msg is ToolProgressMessage {
  return hasType(msg) && msg.type === 'tool_progress' && hasToolUseId(msg) && hasElapsedMillis(msg);
}

export function isToolSummaryMessage(msg: unknown): msg is ToolSummaryMessage {
  return hasType(msg) && msg.type === 'tool_use_summary' && hasSummary(msg) && hasToolUseIds(msg);
}

export function isSystemMessage(msg: unknown): msg is SystemMessage {
  return hasType(msg) && msg.type === 'system' && hasSubtype(msg);
}

function hasSubtype(msg: unknown): msg is { subtype: string } {
  return typeof msg === 'object' && msg !== null && 'subtype' in msg && typeof (msg as { subtype: unknown }).subtype === 'string';
}

function hasContent(msg: unknown): msg is { content: readonly unknown[] } {
  return typeof msg === 'object' && msg !== null && 'content' in msg && Array.isArray((msg as { content: unknown }).content);
}

function hasToolUseId(msg: unknown): msg is { tool_use_id: string } {
  return typeof msg === 'object' && msg !== null && 'tool_use_id' in msg && typeof (msg as { tool_use_id: unknown }).tool_use_id === 'string';
}

function hasElapsedMillis(msg: unknown): msg is { elapsed_millis: number } {
  return typeof msg === 'object' && msg !== null && 'elapsed_millis' in msg && typeof (msg as { elapsed_millis: unknown }).elapsed_millis === 'number';
}

function hasSummary(msg: unknown): msg is { summary: string } {
  return typeof msg === 'object' && msg !== null && 'summary' in msg && typeof (msg as { summary: unknown }).summary === 'string';
}

function hasToolUseIds(msg: unknown): msg is { tool_use_ids: readonly string[] } {
  return typeof msg === 'object' && msg !== null && 'tool_use_ids' in msg && Array.isArray((msg as { tool_use_ids: unknown }).tool_use_ids);
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
  readonly content: readonly unknown[];
  readonly usage?: {
    readonly input_tokens: number;
    readonly output_tokens: number;
  };
}

export interface ToolProgressMessage {
  readonly type: 'tool_progress';
  readonly tool_use_id: string;
  readonly elapsed_millis: number;
}

export interface ToolSummaryMessage {
  readonly type: 'tool_use_summary';
  readonly summary: string;
  readonly tool_use_ids: readonly string[];
}

export interface SystemMessage {
  readonly type: 'system';
  readonly subtype: string;
  readonly status?: string;
  readonly model?: string;
  readonly tools?: readonly unknown[];
  readonly plugins?: readonly unknown[];
}
