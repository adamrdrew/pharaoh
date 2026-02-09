// Tests for assistant event capture

import { describe, it, expect } from 'vitest';
import { captureAssistantEvents } from '../src/runner-events-assistant.js';
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

function makeMsg(content: unknown[] = [], usage?: { input_tokens: number; output_tokens: number }) {
  return { type: 'assistant' as const, message: { content, usage } };
}

describe('captureAssistantEvents', () => {
  it('captures tool use events', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const msg = makeMsg([{ type: 'tool_use' as const, id: 'tool-1', name: 'read', input: { path: '/file.txt' } }]);
    await captureAssistantEvents(msg, 1, writer);
    const content = await fs.readFile('/events.jsonl');
    const lines = content.trim().split('\n');
    const toolEvent = JSON.parse(lines[0]);
    expect(toolEvent.type).toBe('tool_call');
    expect(toolEvent.summary).toBe('Tool: read');
  });

  it('captures text events', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const msg = makeMsg([{ type: 'text' as const, text: 'Hello world' }]);
    await captureAssistantEvents(msg, 1, writer);
    const content = await fs.readFile('/events.jsonl');
    const lines = content.trim().split('\n');
    const textEvent = JSON.parse(lines[0]);
    expect(textEvent.type).toBe('text');
    expect(textEvent.summary).toBe('Hello world');
  });

  it('captures turn event with usage from message wrapper', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const msg = makeMsg([], { input_tokens: 100, output_tokens: 50 });
    await captureAssistantEvents(msg, 2, writer);
    const content = await fs.readFile('/events.jsonl');
    const lines = content.trim().split('\n');
    const turnEvent = JSON.parse(lines[0]);
    expect(turnEvent.type).toBe('turn');
    expect(turnEvent.summary).toBe('Turn 2');
    expect(turnEvent.detail.input_tokens).toBe(100);
    expect(turnEvent.detail.output_tokens).toBe(50);
  });

  it('captures multiple content blocks', async () => {
    const fs = new FakeFilesystem();
    const writer = new EventWriter(fs, '/events.jsonl');
    const msg = makeMsg([
      { type: 'text' as const, text: 'Processing' },
      { type: 'tool_use' as const, id: 'tool-1', name: 'read', input: {} }
    ]);
    await captureAssistantEvents(msg, 1, writer);
    const content = await fs.readFile('/events.jsonl');
    const lines = content.trim().split('\n');
    expect(lines.length).toBe(3);
  });
});
