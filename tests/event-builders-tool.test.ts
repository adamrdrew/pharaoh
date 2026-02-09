// Tests for tool event builders

import { describe, it, expect } from 'vitest';
import { buildToolProgressEvent, buildToolSummaryEvent } from '../src/event-builders-tool.js';

describe('buildToolProgressEvent', () => {
  it('creates progress event with elapsed time', () => {
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', elapsed_millis: 5000 };
    const event = buildToolProgressEvent(message);
    expect(event.type).toBe('tool_progress');
    expect(event.summary).toBe('Progress: 5000ms');
    expect(event.detail?.tool_use_id).toBe('tool-1');
    expect(event.detail?.elapsed_millis).toBe(5000);
  });

  it('formats elapsed time in summary', () => {
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-2', elapsed_millis: 12345 };
    const event = buildToolProgressEvent(message);
    expect(event.summary).toBe('Progress: 12345ms');
  });
});

describe('buildToolSummaryEvent', () => {
  it('creates summary event with tool use IDs', () => {
    const message = { type: 'tool_use_summary' as const, summary: 'Completed successfully', tool_use_ids: ['tool-1', 'tool-2'] };
    const event = buildToolSummaryEvent(message);
    expect(event.type).toBe('tool_summary');
    expect(event.summary).toBe('Completed successfully');
    expect(event.detail?.tool_use_ids).toEqual(['tool-1', 'tool-2']);
  });

  it('handles single tool use ID', () => {
    const message = { type: 'tool_use_summary' as const, summary: 'Done', tool_use_ids: ['tool-1'] };
    const event = buildToolSummaryEvent(message);
    expect(event.detail?.tool_use_ids).toEqual(['tool-1']);
  });
});
