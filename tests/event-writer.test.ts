// Tests for EventWriter

import { describe, it, expect } from 'vitest';
import { EventWriter, type PharaohEvent } from '../src/event-writer.js';
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

describe('EventWriter', () => {
  it('writes event as JSON line', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const event: PharaohEvent = { timestamp: '2024-01-01T00:00:00.000Z', type: 'test', summary: 'Test event' };
    await writer.write(event);
    const content = await fs.readFile('/events.jsonl');
    expect(content).toBe('{"timestamp":"2024-01-01T00:00:00.000Z","type":"test","summary":"Test event"}\n');
  });

  it('appends multiple events with newlines', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    await writer.write({ timestamp: '2024-01-01T00:00:00.000Z', type: 'test', summary: 'Event 1' });
    await writer.write({ timestamp: '2024-01-01T00:00:01.000Z', type: 'test', summary: 'Event 2' });
    const content = await fs.readFile('/events.jsonl');
    expect(content).toBe('{"timestamp":"2024-01-01T00:00:00.000Z","type":"test","summary":"Event 1"}\n{"timestamp":"2024-01-01T00:00:01.000Z","type":"test","summary":"Event 2"}\n');
  });

  it('clears events file', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    await writer.write({ timestamp: '2024-01-01T00:00:00.000Z', type: 'test', summary: 'Event 1' });
    await writer.clear();
    const content = await fs.readFile('/events.jsonl');
    expect(content).toBe('');
  });

  it('writes events with detail field', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const event: PharaohEvent = { timestamp: '2024-01-01T00:00:00.000Z', type: 'test', summary: 'Test', detail: { foo: 'bar' } };
    await writer.write(event);
    const content = await fs.readFile('/events.jsonl');
    expect(content).toBe('{"timestamp":"2024-01-01T00:00:00.000Z","type":"test","summary":"Test","detail":{"foo":"bar"}}\n');
  });
});
