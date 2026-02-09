// Tests for tool event capture

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { captureToolProgressEvent, captureToolSummaryEvent } from '../src/runner-events-tool.js';
import { EventWriter } from '../src/event-writer.js';
import { ProgressDebouncer } from '../src/event-debouncer.js';
import type { Filesystem } from '../src/status.js';

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) throw new Error(`ENOENT: ${path}`);
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async appendFile(path: string, content: string): Promise<void> {
    const existing = this.files.get(path) ?? '';
    this.files.set(path, existing + content);
  }
}

describe('captureToolProgressEvent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('captures progress event when debouncer allows', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const debouncer = new ProgressDebouncer(5000);
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', elapsed_time_seconds: 1.5 };
    await captureToolProgressEvent(message, debouncer, writer);
    const content = await fs.readFile('/events.jsonl');
    expect(content).toContain('tool_progress');
  });

  it('skips progress event when debouncer blocks', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const debouncer = new ProgressDebouncer(5000);
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', elapsed_time_seconds: 1.5 };
    await captureToolProgressEvent(message, debouncer, writer);
    vi.advanceTimersByTime(4000);
    await captureToolProgressEvent(message, debouncer, writer);
    const content = await fs.readFile('/events.jsonl');
    const lines = content.trim().split('\n').filter(l => l);
    expect(lines.length).toBe(1);
  });

  it('marks write after capturing', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const debouncer = new ProgressDebouncer(5000);
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', elapsed_time_seconds: 1.5 };
    await captureToolProgressEvent(message, debouncer, writer);
    expect(debouncer.shouldWrite('tool-1')).toBe(false);
  });

  it('includes tool_name in event when present', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const debouncer = new ProgressDebouncer(5000);
    const message = { type: 'tool_progress' as const, tool_use_id: 'tool-1', tool_name: 'read', elapsed_time_seconds: 3 };
    await captureToolProgressEvent(message, debouncer, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.summary).toBe('read: 3s');
  });
});

describe('captureToolSummaryEvent', () => {
  it('captures summary event with preceding tool use IDs', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'tool_use_summary' as const, summary: 'Done', preceding_tool_use_ids: ['tool-1'] };
    await captureToolSummaryEvent(message, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.type).toBe('tool_summary');
    expect(event.summary).toBe('Done');
    expect(event.detail.preceding_tool_use_ids).toEqual(['tool-1']);
  });
});
