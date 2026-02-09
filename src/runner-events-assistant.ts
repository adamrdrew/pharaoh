// Event capture for assistant messages

import type { EventWriter } from './event-writer.js';
import {
  buildAssistantToolCallEvent,
  buildAssistantTextEvent,
  buildAssistantTurnEvent,
} from './event-builders-assistant.js';

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

interface AssistantMessage {
  readonly type: 'assistant';
  readonly message: {
    readonly content: readonly ContentBlock[];
    readonly usage?: {
      readonly input_tokens: number;
      readonly output_tokens: number;
    };
  };
}

export async function captureAssistantEvents(
  msg: AssistantMessage,
  turnNumber: number,
  eventWriter: EventWriter
): Promise<void> {
  await captureContentEvents(msg, eventWriter);
  await captureTurnEvent(msg, turnNumber, eventWriter);
}

async function captureContentEvents(msg: AssistantMessage, eventWriter: EventWriter): Promise<void> {
  for (const block of msg.message.content) {
    await captureContentBlock(msg, block, eventWriter);
  }
}

async function captureContentBlock(msg: AssistantMessage, block: ContentBlock, eventWriter: EventWriter): Promise<void> {
  if (block.type === 'tool_use') await captureToolUse(msg, block, eventWriter);
  if (block.type === 'text') await captureText(msg, block, eventWriter);
}

async function captureToolUse(msg: AssistantMessage, block: ToolUseBlock, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantToolCallEvent(msg, block);
  await eventWriter.write(event);
}

async function captureText(msg: AssistantMessage, block: TextBlock, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantTextEvent(msg, block);
  await eventWriter.write(event);
}

async function captureTurnEvent(msg: AssistantMessage, turnNumber: number, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantTurnEvent(msg, turnNumber);
  await eventWriter.write(event);
}
