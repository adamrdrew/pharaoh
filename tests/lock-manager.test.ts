// Tests for lock manager

import { describe, test, expect } from 'vitest';
import { RealLockManager } from '../src/lock-manager.js';
import type { LockManager, PidChecker } from '../src/lock-manager.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { LockInfo } from '../src/lock-types.js';

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();
  private exclusiveFiles = new Set<string>();

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
    this.exclusiveFiles.delete(path);
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
    this.exclusiveFiles.add(path);
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

describe('LockManager', () => {
  test('acquire succeeds when no lock exists', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock.acquire();
    expect(result.ok).toBe(true);
  });

  test('acquire returns held-by-other when lock held by live process', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const existingLock = buildLock(99999);
    fs.setFile('/lock', JSON.stringify(existingLock));
    pidChecker.setRunning(99999);
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock.acquire();
    expect(result.ok).toBe(false);
  });

  test('acquire overwrites stale lock when PID not running', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const staleLock = buildLock(88888);
    fs.setFile('/lock', JSON.stringify(staleLock));
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    const result = await lock.acquire();
    expect(result.ok).toBe(true);
  });

  test('validate returns true when lock owned', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    await lock.acquire();
    const valid = await lock.validate();
    expect(valid).toBe(true);
  });

  test('validate returns false when lock file deleted', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    await lock.acquire();
    await fs.unlink('/lock');
    const valid = await lock.validate();
    expect(valid).toBe(false);
  });

  test('validate returns false when lock file modified', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    await lock.acquire();
    const otherLock = buildLock(77777);
    await fs.writeFile('/lock', JSON.stringify(otherLock));
    const valid = await lock.validate();
    expect(valid).toBe(false);
  });

  test('release removes lock file', async () => {
    const fs = new FakeFilesystem();
    const pidChecker = new FakePidChecker();
    const lock = new RealLockManager(fs, '/lock', pidChecker);
    await lock.acquire();
    await lock.release();
    const exists = await fs.exists('/lock');
    expect(exists).toBe(false);
  });
});

function buildLock(pid: number): LockInfo {
  return { pid, started: new Date().toISOString(), instanceId: `test-${pid}` };
}
