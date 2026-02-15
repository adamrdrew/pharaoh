// Tests for runner periodic lock validation

import { describe, test, expect } from 'vitest';
import { PhaseRunner } from '../src/runner.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { Logger } from '../src/log.js';
import { StatusManager } from '../src/status.js';
import { FakeLockManager } from './fakes/fake-lock-manager.js';

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error('File not found');
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async appendFile(path: string, content: string): Promise<void> {
    const existing = this.files.get(path) ?? '';
    this.files.set(path, existing + content);
  }

  async mkdir(): Promise<void> {}

  async rename(old: string, newPath: string): Promise<void> {
    const content = this.files.get(old);
    if (content) {
      this.files.set(newPath, content);
      this.files.delete(old);
    }
  }

  async unlink(path: string): Promise<void> {
    this.files.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async readdir(): Promise<string[]> {
    return [];
  }

  async stat(): Promise<FilesystemStats> {
    return { isDirectory: () => false, mtimeMs: Date.now() };
  }

  async openExclusive(path: string, content: string): Promise<void> {
    if (this.files.has(path)) throw new Error('EEXIST');
    this.files.set(path, content);
  }
}

class FakeLogger implements Logger {
  readonly logs: Array<{ level: string; message: string; meta?: unknown }> = [];

  async info(message: string, meta?: unknown): Promise<void> {
    this.logs.push({ level: 'info', message, meta });
  }

  async warn(message: string, meta?: unknown): Promise<void> {
    this.logs.push({ level: 'warn', message, meta });
  }

  async error(message: string, meta?: unknown): Promise<void> {
    this.logs.push({ level: 'error', message, meta });
  }

  async debug(message: string, meta?: unknown): Promise<void> {
    this.logs.push({ level: 'debug', message, meta });
  }
}

class FakeEventWriter {
  async clear(): Promise<void> {}
  async write(): Promise<void> {}
}

describe('Runner periodic lock validation', () => {
  test('lock validation called periodically every 10 turns', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json');
    const lock = new FakeLockManager();
    await lock.acquire();
    const eventWriter = new FakeEventWriter();
    const runner = new PhaseRunner(
      logger,
      status,
      { cwd: '/project', model: 'claude-opus-4' },
      eventWriter as any,
      fs,
      lock
    );
    let validateCallCount = 0;
    const originalValidate = lock.validate.bind(lock);
    lock.validate = async () => {
      validateCallCount++;
      return originalValidate();
    };
    const state = { turns: 20, costUsd: 0, messageCounter: 0, inputTokens: 0, outputTokens: 0, turnsElapsed: 20, runningCostUsd: 0 };
    await (runner as any).validateLockPeriodically(10);
    await (runner as any).validateLockPeriodically(20);
    await (runner as any).validateLockPeriodically(5);
    expect(validateCallCount).toBe(2);
  });

  test('lock validation failure returns blocked result', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const status = new StatusManager(fs, '/pharaoh.json');
    const lock = new FakeLockManager();
    await lock.acquire();
    lock.simulateLockStolen();
    const eventWriter = new FakeEventWriter();
    const runner = new PhaseRunner(
      logger,
      status,
      { cwd: '/project', model: 'claude-opus-4' },
      eventWriter as any,
      fs,
      lock
    );
    const state = { turns: 10, costUsd: 1.5, messageCounter: 0, inputTokens: 0, outputTokens: 0, turnsElapsed: 10, runningCostUsd: 1.5 };
    const result = (runner as any).buildLockFailureResult('test-phase', state, Date.now() - 5000);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('blocked');
    expect(result.error).toContain('Lock stolen');
  });
});
