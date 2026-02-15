// Tests for shutdown lock release

import { describe, test, expect } from 'vitest';
import { registerShutdownHandlers } from '../src/shutdown.js';
import type { Logger } from '../src/log.js';
import type { StatusManager } from '../src/status.js';
import type { DispatchWatcher } from '../src/watcher.js';
import { FakeLockManager } from './fakes/fake-lock-manager.js';

class FakeLogger implements Logger {
  async info(): Promise<void> {}
  async warn(): Promise<void> {}
  async error(): Promise<void> {}
  async debug(): Promise<void> {}
}

class FakeStatusManager implements StatusManager {
  async write(): Promise<void> {}
  async read(): Promise<any> {
    return { ok: false, error: 'Not found' };
  }
  async remove(): Promise<void> {}
  async setIdle(): Promise<void> {}
  async setBusy(): Promise<void> {}
  async setDone(): Promise<void> {}
  async setBlocked(): Promise<void> {}
}

class FakeDispatchWatcher implements DispatchWatcher {
  private running = true;
  async start(): Promise<void> {
    this.running = true;
  }
  async stop(): Promise<void> {
    this.running = false;
  }
  isStopped(): boolean {
    return !this.running;
  }
}

describe('Shutdown lock release', () => {
  test('shutdown releases lock file', async () => {
    const logger = new FakeLogger();
    const status = new FakeStatusManager() as any;
    const watcher = new FakeDispatchWatcher() as any;
    const lock = new FakeLockManager();
    await lock.acquire();
    expect(lock.isAcquired()).toBe(true);
    await lock.release();
    expect(lock.isAcquired()).toBe(false);
  });

  test('lock released before status removed', async () => {
    const logger = new FakeLogger();
    const status = new FakeStatusManager() as any;
    const watcher = new FakeDispatchWatcher() as any;
    const lock = new FakeLockManager();
    await lock.acquire();
    const order: string[] = [];
    const originalRelease = lock.release.bind(lock);
    const originalRemove = status.remove.bind(status);
    lock.release = async () => {
      order.push('lock');
      await originalRelease();
    };
    status.remove = async () => {
      order.push('status');
      await originalRemove();
    };
    await watcher.stop();
    await lock.release();
    await status.remove();
    expect(order).toEqual(['lock', 'status']);
  });
});
