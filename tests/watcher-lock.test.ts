// Tests for watcher pre-dispatch lock validation

import { describe, test, expect } from 'vitest';
import { DispatchWatcher } from '../src/watcher.js';
import { StatusManager } from '../src/status.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { Logger } from '../src/log.js';
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

  getFile(path: string): string | undefined {
    return this.files.get(path);
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

  hasError(message: string): boolean {
    return this.logs.some(log => log.level === 'error' && log.message.includes(message));
  }
}

describe('Watcher pre-dispatch validation', () => {
  test('dispatch aborted when lock validation fails', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const lock = new FakeLockManager();
    await lock.acquire();
    lock.simulateLockStolen();
    const watcher = buildWatcher(fs, logger, lock);
    await (watcher as any).processDispatchFile('/dispatch/test.md');
    const hasLockError = logger.hasError('Lock validation failed');
    expect(hasLockError).toBe(true);
  });

  test('lock validation called before dispatch execution', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    const lock = new FakeLockManager();
    await lock.acquire();
    const watcher = buildWatcher(fs, logger, lock);
    lock.simulateLockStolen();
    await (watcher as any).processDispatchFile('/dispatch/test.md');
    const hasLockError = logger.hasError('Lock validation failed');
    expect(hasLockError).toBe(true);
  });
});

function buildWatcher(
  fs: Filesystem,
  logger: Logger,
  lock: FakeLockManager
): DispatchWatcher {
  const status = new StatusManager(fs, '/pharaoh.json');
  const deps = {
    fs,
    logger,
    status,
    runner: null as any,
    git: null as any,
    lock,
  };
  const options = {
    dispatchPath: '/dispatch',
    pid: 12345,
    started: '2025-01-01T00:00:00Z',
    metadata: {
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
    },
  };
  return new DispatchWatcher(deps, options);
}
