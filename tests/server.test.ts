// Tests for server startup lock integration

import { describe, test, expect } from 'vitest';
import { RealLockManager } from '../src/lock-manager.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { PidChecker } from '../src/lock-manager.js';
import type { LockInfo } from '../src/lock-types.js';

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

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
    if (!content) throw new Error('File not found');
    this.files.set(newPath, content);
    this.files.delete(old);
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
    if (this.files.has(path)) throw createExistError();
    this.files.set(path, content);
  }
}

class FakePidChecker implements PidChecker {
  private running = new Set<number>();

  setRunning(pid: number): void {
    this.running.add(pid);
  }

  isRunning(pid: number): boolean {
    return this.running.has(pid);
  }
}

function createExistError(): Error {
  const err = new Error('EEXIST');
  (err as NodeJS.ErrnoException).code = 'EEXIST';
  return err;
}

describe('Server startup lock integration', () => {
  test('startup acquires lock and creates lock file', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock.acquire();
    expect(result.ok).toBe(true);
    const exists = await fs.exists('/lock');
    expect(exists).toBe(true);
  });

  test('second startup fails when lock held', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock1 = new RealLockManager(fs, '/lock', pidChecker);
    await lock1.acquire();
    pidChecker.setRunning(process.pid);
    const content = await fs.readFile('/lock');
    const lockInfo = JSON.parse(content) as LockInfo;
    pidChecker.setRunning(lockInfo.pid);
    const lock2 = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock2.acquire();
    expect(result.ok).toBe(false);
  });

  test('startup succeeds after stale lock detected', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const staleLock = buildStaleLock(88888);
    fs.setFile('/lock', JSON.stringify(staleLock));
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock.acquire();
    expect(result.ok).toBe(true);
  });
});

function buildStaleLock(pid: number): LockInfo {
  return { pid, started: new Date().toISOString(), instanceId: 'stale' };
}
