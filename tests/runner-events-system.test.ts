// Tests for system and result event capture

import { describe, it, expect } from 'vitest';
import { captureSystemEvent, captureResultEvent } from '../src/runner-events-system.js';
import { EventWriter } from '../src/event-writer.js';
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

describe('captureSystemEvent', () => {
  it('captures init event', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'system' as const, subtype: 'init', model: 'opus-4' };
    await captureSystemEvent(message, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.type).toBe('status');
    expect(event.summary).toBe('SDK initialized');
  });

  it('captures status event', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'system' as const, subtype: 'status', status: 'Working' };
    await captureSystemEvent(message, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.type).toBe('status');
    expect(event.summary).toBe('Working');
  });

  it('ignores unknown subtypes', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'system' as const, subtype: 'unknown' };
    await captureSystemEvent(message, writer);
    // No events written for unknown subtype, so file should not exist
    await expect(fs.readFile('/events.jsonl')).rejects.toThrow('ENOENT');
  });
});

describe('captureResultEvent', () => {
  it('captures success result', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'result' as const, subtype: 'success', num_turns: 5, total_cost_usd: 1.0, errors: [] };
    await captureResultEvent(message, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.type).toBe('result');
    expect(event.summary).toContain('Phase complete');
  });

  it('captures error result', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const message = { type: 'result' as const, subtype: 'error', num_turns: 2, total_cost_usd: 0.5, errors: ['Failed'] };
    await captureResultEvent(message, writer);
    const content = await fs.readFile('/events.jsonl');
    const event = JSON.parse(content.trim());
    expect(event.type).toBe('error');
    expect(event.summary).toBe('Failed');
  });
});
