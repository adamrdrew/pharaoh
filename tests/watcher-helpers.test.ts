// Integration tests for watcher helper functions

import { describe, it, expect } from 'vitest';
import { reportPhaseComplete } from '../src/watcher-helpers.js';
import { StatusManager } from '../src/status.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { Logger } from '../src/log.js';
import type { ProcessContext } from '../src/watcher-context.js';

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
  async mkdir(_path: string, _options?: { recursive: boolean }): Promise<void> {}
  async rename(oldPath: string, newPath: string): Promise<void> {
    const content = this.files.get(oldPath);
    if (content !== undefined) {
      this.files.set(newPath, content);
      this.files.delete(oldPath);
    }
  }
  async unlink(path: string): Promise<void> {
    this.files.delete(path);
  }
  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }
  async readdir(_path: string): Promise<string[]> {
    return [];
  }
  async stat(_path: string): Promise<FilesystemStats> {
    return { isDirectory: () => false, mtimeMs: Date.now() };
  }
  getWrittenFile(path: string): string | undefined {
    return this.files.get(path);
  }
}

class FakeLogger implements Logger {
  async info(_message: string, _meta?: unknown): Promise<void> {}
  async warn(_message: string, _meta?: unknown): Promise<void> {}
  async error(_message: string, _meta?: unknown): Promise<void> {}
  async debug(_message: string, _meta?: unknown): Promise<void> {}
}

describe('reportPhaseComplete counter increment', () => {
  it('done status reflects incremented counter value after successful phase', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json', '/pharaoh.log');
    const ctx: ProcessContext = {
      fs,
      logger,
      status,
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      metadata: {
        pharaohVersion: '1.0.0',
        ushabtiVersion: '2.0.0',
        model: 'claude-opus-4',
        cwd: '/project',
      },
      phasesCompleted: 0,
    };
    const result = { ok: true, costUsd: 0.15, turns: 10 };
    const updatedCounter = 1;
    await reportPhaseComplete(ctx, 'test-phase', result, updatedCounter);
    const written = fs.getWrittenFile('/pharaoh.json');
    expect(written).toBeDefined();
    const parsed = JSON.parse(written!);
    expect(parsed.status).toBe('idle');
    expect(parsed.phasesCompleted).toBe(1);
  });

  it('done status shows post-increment value not pre-increment value', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json', '/pharaoh.log');
    const ctx: ProcessContext = {
      fs,
      logger,
      status,
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      metadata: {
        pharaohVersion: '1.0.0',
        ushabtiVersion: '2.0.0',
        model: 'claude-opus-4',
        cwd: '/project',
      },
      phasesCompleted: 5,
    };
    const result = { ok: true, costUsd: 0.20, turns: 15 };
    const updatedCounter = 6;
    await reportPhaseComplete(ctx, 'phase-six', result, updatedCounter);
    const written = fs.getWrittenFile('/pharaoh.json');
    expect(written).toBeDefined();
    const parsed = JSON.parse(written!);
    expect(parsed.phasesCompleted).toBe(6);
    expect(parsed.phasesCompleted).not.toBe(5);
  });

  it('counter increments across multiple sequential completions', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json', '/pharaoh.log');
    let currentCounter = 0;
    for (let i = 0; i < 3; i++) {
      const ctx: ProcessContext = {
        fs,
        logger,
        status,
        pid: 12345,
        started: '2025-01-01T00:00:00Z',
        metadata: {
          pharaohVersion: '1.0.0',
          ushabtiVersion: '2.0.0',
          model: 'claude-opus-4',
          cwd: '/project',
        },
        phasesCompleted: currentCounter,
      };
      const result = { ok: true, costUsd: 0.10, turns: 5 };
      currentCounter += 1;
      await reportPhaseComplete(ctx, `phase-${i + 1}`, result, currentCounter);
      const written = fs.getWrittenFile('/pharaoh.json');
      expect(written).toBeDefined();
      const parsed = JSON.parse(written!);
      expect(parsed.phasesCompleted).toBe(currentCounter);
    }
    const finalWritten = fs.getWrittenFile('/pharaoh.json');
    const finalParsed = JSON.parse(finalWritten!);
    expect(finalParsed.phasesCompleted).toBe(3);
  });

  it('blocked phases do not increment counter', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json', '/pharaoh.log');
    const ctx: ProcessContext = {
      fs,
      logger,
      status,
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      metadata: {
        pharaohVersion: '1.0.0',
        ushabtiVersion: '2.0.0',
        model: 'claude-opus-4',
        cwd: '/project',
      },
      phasesCompleted: 2,
    };
    const result = { ok: false, costUsd: 0.05, turns: 3, error: 'Phase failed' };
    const unchangedCounter = 2;
    await reportPhaseComplete(ctx, 'failed-phase', result, unchangedCounter);
    const written = fs.getWrittenFile('/pharaoh.json');
    expect(written).toBeDefined();
    const parsed = JSON.parse(written!);
    expect(parsed.phasesCompleted).toBe(2);
  });
});
