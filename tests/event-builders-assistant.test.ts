// Tests for assistant event builders

import { describe, it, expect } from 'vitest';
import { buildAssistantToolCallEvent, buildAssistantTextEvent, buildAssistantTurnEvent } from '../src/event-builders-assistant.js';

describe('buildAssistantToolCallEvent', () => {
  it('creates tool call event with truncated input', () => {
    const message = { type: 'assistant' as const, content: [] };
    const toolUse = { type: 'tool_use' as const, id: 'tool-1', name: 'read', input: { path: '/file.txt' } };
    const event = buildAssistantToolCallEvent(message, toolUse);
    expect(event.type).toBe('tool_call');
    expect(event.summary).toBe('Tool: read');
    expect(event.detail?.tool_use_id).toBe('tool-1');
    expect(event.detail?.tool_name).toBe('read');
    expect(typeof event.detail?.input).toBe('string');
  });

  it('truncates long input to 500 characters', () => {
    const message = { type: 'assistant' as const, content: [] };
    const longInput = { data: 'x'.repeat(600) };
    const toolUse = { type: 'tool_use' as const, id: 'tool-1', name: 'read', input: longInput };
    const event = buildAssistantToolCallEvent(message, toolUse);
    const inputStr = event.detail?.input as string;
    expect(inputStr.length).toBe(503);
    expect(inputStr.endsWith('...')).toBe(true);
  });
});

describe('buildAssistantTextEvent', () => {
  it('creates text event with truncated summary', () => {
    const message = { type: 'assistant' as const, content: [] };
    const textBlock = { type: 'text' as const, text: 'Short message' };
    const event = buildAssistantTextEvent(message, textBlock);
    expect(event.type).toBe('text');
    expect(event.summary).toBe('Short message');
    expect(event.detail?.full_text).toBe('Short message');
  });

  it('truncates long text to 200 characters in summary', () => {
    const message = { type: 'assistant' as const, content: [] };
    const longText = 'x'.repeat(300);
    const textBlock = { type: 'text' as const, text: longText };
    const event = buildAssistantTextEvent(message, textBlock);
    expect(event.summary.length).toBe(203);
    expect(event.summary.endsWith('...')).toBe(true);
    expect(event.detail?.full_text).toBe(longText);
  });
});

describe('buildAssistantTurnEvent', () => {
  it('creates turn event with token usage', () => {
    const message = { type: 'assistant' as const, content: [], usage: { input_tokens: 100, output_tokens: 50 } };
    const event = buildAssistantTurnEvent(message, 3);
    expect(event.type).toBe('turn');
    expect(event.summary).toBe('Turn 3');
    expect(event.detail?.turn).toBe(3);
    expect(event.detail?.input_tokens).toBe(100);
    expect(event.detail?.output_tokens).toBe(50);
  });

  it('creates turn event without usage', () => {
    const message = { type: 'assistant' as const, content: [] };
    const event = buildAssistantTurnEvent(message, 1);
    expect(event.type).toBe('turn');
    expect(event.summary).toBe('Turn 1');
    expect(event.detail?.input_tokens).toBeUndefined();
    expect(event.detail?.output_tokens).toBeUndefined();
  });
});
