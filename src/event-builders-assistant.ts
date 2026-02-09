// Event builders for assistant messages

import type { PharaohEvent } from './event-writer.js';
import { truncate, timestamp } from './event-builders-utils.js';

interface ToolUseBlock {
  readonly type: 'tool_use';
  readonly id: string;
  readonly name: string;
  readonly input: Record<string, unknown>;
}

interface TextBlock {
  readonly type: 'text';
  readonly text: string;
}

type ContentBlock = ToolUseBlock | TextBlock;

interface AssistantMessageInner {
  readonly content: readonly ContentBlock[];
  readonly usage?: {
    readonly input_tokens: number;
    readonly output_tokens: number;
  };
}

interface AssistantMessage {
  readonly type: 'assistant';
  readonly message: AssistantMessageInner;
}

export function buildAssistantToolCallEvent(msg: AssistantMessage, toolUse: ToolUseBlock): PharaohEvent {
  const inputJson = JSON.stringify(toolUse.input);
  return createToolCallEvent(toolUse.name, toolUse.id, inputJson);
}

function createToolCallEvent(toolName: string, toolId: string, inputJson: string): PharaohEvent {
  return { timestamp: timestamp(), type: 'tool_call', summary: `Tool: ${toolName}`, detail: { tool_use_id: toolId, tool_name: toolName, input: truncate(inputJson, 500) } };
}

export function buildAssistantTextEvent(msg: AssistantMessage, textBlock: TextBlock): PharaohEvent {
  return { timestamp: timestamp(), type: 'text', summary: truncate(textBlock.text, 200), detail: { full_text: textBlock.text } };
}

export function buildAssistantTurnEvent(msg: AssistantMessage, turnNumber: number): PharaohEvent {
  return createTurnEvent(turnNumber, msg.message.usage);
}

function createTurnEvent(turnNumber: number, usage?: { readonly input_tokens: number; readonly output_tokens: number }): PharaohEvent {
  return { timestamp: timestamp(), type: 'turn', summary: `Turn ${turnNumber}`, detail: { turn: turnNumber, input_tokens: usage?.input_tokens, output_tokens: usage?.output_tokens } };
}
