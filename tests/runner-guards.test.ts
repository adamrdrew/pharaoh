// Tests for SDK message type guards

import { describe, it, expect } from 'vitest';
import { hasType, isResultMessage, isAssistantMessage, isToolProgressMessage, isToolSummaryMessage, isSystemMessage } from '../src/runner-guards.js';

describe('hasType', () => {
  it('returns true for object with type string', () => {
    expect(hasType({ type: 'test' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(hasType(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(hasType('test')).toBe(false);
  });

  it('returns false for object without type', () => {
    expect(hasType({ foo: 'bar' })).toBe(false);
  });

  it('returns false for object with non-string type', () => {
    expect(hasType({ type: 123 })).toBe(false);
  });
});

describe('isResultMessage', () => {
  it('returns true for valid result message', () => {
    expect(isResultMessage({ type: 'result', subtype: 'success' })).toBe(true);
  });

  it('returns false for missing subtype', () => {
    expect(isResultMessage({ type: 'result' })).toBe(false);
  });

  it('returns false for wrong type', () => {
    expect(isResultMessage({ type: 'assistant', subtype: 'success' })).toBe(false);
  });
});

describe('isAssistantMessage', () => {
  it('returns true for valid SDK assistant message', () => {
    expect(isAssistantMessage({ type: 'assistant', message: { content: [] } })).toBe(true);
  });

  it('returns true with usage data', () => {
    expect(isAssistantMessage({ type: 'assistant', message: { content: [], usage: { input_tokens: 10, output_tokens: 5 } } })).toBe(true);
  });

  it('returns false for missing message wrapper', () => {
    expect(isAssistantMessage({ type: 'assistant', content: [] })).toBe(false);
  });

  it('returns false for missing content inside message', () => {
    expect(isAssistantMessage({ type: 'assistant', message: {} })).toBe(false);
  });

  it('returns false for non-array content', () => {
    expect(isAssistantMessage({ type: 'assistant', message: { content: 'text' } })).toBe(false);
  });

  it('returns false for null message wrapper', () => {
    expect(isAssistantMessage({ type: 'assistant', message: null })).toBe(false);
  });
});

describe('isToolProgressMessage', () => {
  it('returns true for valid tool progress message', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', tool_use_id: 'id', elapsed_time_seconds: 1.5 })).toBe(true);
  });

  it('returns true with tool_name', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', tool_use_id: 'id', tool_name: 'read', elapsed_time_seconds: 2 })).toBe(true);
  });

  it('returns false for missing tool_use_id', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', elapsed_time_seconds: 1 })).toBe(false);
  });

  it('returns false for non-string tool_use_id', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', tool_use_id: 123, elapsed_time_seconds: 1 })).toBe(false);
  });

  it('returns false for non-number elapsed_time_seconds', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', tool_use_id: 'id', elapsed_time_seconds: 'fast' })).toBe(false);
  });

  it('returns false for old elapsed_millis field', () => {
    expect(isToolProgressMessage({ type: 'tool_progress', tool_use_id: 'id', elapsed_millis: 1000 })).toBe(false);
  });
});

describe('isToolSummaryMessage', () => {
  it('returns true for valid tool summary message', () => {
    expect(isToolSummaryMessage({ type: 'tool_use_summary', summary: 'done', preceding_tool_use_ids: ['id1'] })).toBe(true);
  });

  it('returns false for missing summary', () => {
    expect(isToolSummaryMessage({ type: 'tool_use_summary', preceding_tool_use_ids: ['id1'] })).toBe(false);
  });

  it('returns false for non-array preceding_tool_use_ids', () => {
    expect(isToolSummaryMessage({ type: 'tool_use_summary', summary: 'done', preceding_tool_use_ids: 'id1' })).toBe(false);
  });

  it('returns false for old tool_use_ids field', () => {
    expect(isToolSummaryMessage({ type: 'tool_use_summary', summary: 'done', tool_use_ids: ['id1'] })).toBe(false);
  });
});

describe('isSystemMessage', () => {
  it('returns true for valid system message', () => {
    expect(isSystemMessage({ type: 'system', subtype: 'init' })).toBe(true);
  });

  it('returns false for missing subtype', () => {
    expect(isSystemMessage({ type: 'system' })).toBe(false);
  });

  it('returns false for non-string subtype', () => {
    expect(isSystemMessage({ type: 'system', subtype: 123 })).toBe(false);
  });
});
