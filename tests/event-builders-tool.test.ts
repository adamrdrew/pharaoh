// Tests for tool event builders

import { describe, it, expect } from 'vitest';
import { buildToolProgressEvent, buildToolSummaryEvent } from '../src/event-builders-tool.js';

describe('buildToolProgressEvent', () => {
  it('creates progress event with elapsed time in seconds', () => {
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', tool_name: 'read', elapsed_time_seconds: 5.2 };
    const event = buildToolProgressEvent(message);
    expect(event.type).toBe('tool_progress');
    expect(event.summary).toBe('read: 5.2s');
    expect(event.detail?.tool_use_id).toBe('tool-1');
    expect(event.detail?.elapsed_seconds).toBe(5.2);
  });

  it('uses tool_use_id in summary when tool_name is absent', () => {
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-2', elapsed_time_seconds: 12 };
    const event = buildToolProgressEvent(message);
    expect(event.summary).toBe('tool-2: 12s');
  });

  it('includes tool_name in detail when present', () => {
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-3', tool_name: 'write', elapsed_time_seconds: 1 };
    const event = buildToolProgressEvent(message);
    expect(event.detail?.tool_name).toBe('write');
  });
});

describe('buildToolSummaryEvent', () => {
  it('creates summary event with preceding tool use IDs', () => {
    const message = { type: 'tool_use_summary' as const, summary: 'Completed successfully', preceding_tool_use_ids: ['tool-1', 'tool-2'] };
    const event = buildToolSummaryEvent(message);
    expect(event.type).toBe('tool_summary');
    expect(event.summary).toBe('Completed successfully');
    expect(event.detail?.preceding_tool_use_ids).toEqual(['tool-1', 'tool-2']);
  });

  it('handles single tool use ID', () => {
    const message = { type: 'tool_use_summary' as const, summary: 'Done', preceding_tool_use_ids: ['tool-1'] };
    const event = buildToolSummaryEvent(message);
    expect(event.detail?.preceding_tool_use_ids).toEqual(['tool-1']);
  });
});
