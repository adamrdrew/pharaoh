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
  readonly content: readonly ContentBlock[];
  readonly usage?: {
    readonly input_tokens: number;
    readonly output_tokens: number;
  };
}

export async function captureAssistantEvents(
  message: AssistantMessage,
  turnNumber: number,
  eventWriter: EventWriter
): Promise<void> {
  await captureContentEvents(message, eventWriter);
  await captureTurnEvent(message, turnNumber, eventWriter);
}

async function captureContentEvents(message: AssistantMessage, eventWriter: EventWriter): Promise<void> {
  for (const block of message.content) {
    await captureContentBlock(message, block, eventWriter);
  }
}

async function captureContentBlock(message: AssistantMessage, block: ContentBlock, eventWriter: EventWriter): Promise<void> {
  if (block.type === 'tool_use') await captureToolUse(message, block, eventWriter);
  if (block.type === 'text') await captureText(message, block, eventWriter);
}

async function captureToolUse(message: AssistantMessage, block: ToolUseBlock, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantToolCallEvent(message, block);
  await eventWriter.write(event);
}

async function captureText(message: AssistantMessage, block: TextBlock, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantTextEvent(message, block);
  await eventWriter.write(event);
}

async function captureTurnEvent(message: AssistantMessage, turnNumber: number, eventWriter: EventWriter): Promise<void> {
  const event = buildAssistantTurnEvent(message, turnNumber);
  await eventWriter.write(event);
}
