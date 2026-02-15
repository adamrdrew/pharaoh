// Tests for Logger log level filtering

import { describe, test, expect } from 'vitest';
import { Logger } from '../src/log.js';
import type { Filesystem } from '../src/status.js';

/**
 * Fake filesystem for testing
 * Implements Filesystem interface without touching real filesystem (L08)
 */
class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async appendFile(path: string, content: string): Promise<void> {
    const existing = this.files.get(path) ?? '';
    this.files.set(path, existing + content);
  }

  async mkdir(_path: string, _options?: { recursive: boolean }): Promise<void> {
    // No-op for testing
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const content = this.files.get(oldPath);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, rename '${oldPath}'`);
    }
    this.files.set(newPath, content);
    this.files.delete(oldPath);
  }

  async unlink(path: string): Promise<void> {
    if (!this.files.has(path)) {
      throw new Error(`ENOENT: no such file or directory, unlink '${path}'`);
    }
    this.files.delete(path);
  }

  async stat(_path: string): Promise<{ isDirectory: () => boolean; isFile: () => boolean }> {
    return {
      isDirectory: () => false,
      isFile: () => true,
    };
  }

  async readdir(_path: string): Promise<string[]> {
    return [];
  }

  watchFile(_path: string, _callback: () => void): void {
    // No-op for testing
  }

  unwatchFile(_path: string): void {
    // No-op for testing
  }

  getFileContents(path: string): string | undefined {
    return this.files.get(path);
  }
}

describe('Logger with no config (default behavior)', () => {
  test('logs all levels when no config provided', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log');

    await logger.debug('debug message');
    await logger.info('info message');
    await logger.warn('warn message');
    await logger.error('error message');

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[DEBUG] debug message');
    expect(content).toContain('[INFO] info message');
    expect(content).toContain('[WARN] warn message');
    expect(content).toContain('[ERROR] error message');
  });
});

describe('Logger with minLevel: info', () => {
  test('suppresses debug logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'info' });

    await logger.debug('debug message');
    await logger.info('info message');

    const content = fs.getFileContents('/test.log');
    expect(content).not.toContain('[DEBUG] debug message');
    expect(content).toContain('[INFO] info message');
  });

  test('allows info, warn, and error logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'info' });

    await logger.info('info message');
    await logger.warn('warn message');
    await logger.error('error message');

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[INFO] info message');
    expect(content).toContain('[WARN] warn message');
    expect(content).toContain('[ERROR] error message');
  });
});

describe('Logger with minLevel: warn', () => {
  test('suppresses debug and info logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'warn' });

    await logger.debug('debug message');
    await logger.info('info message');
    await logger.warn('warn message');

    const content = fs.getFileContents('/test.log');
    expect(content).not.toContain('[DEBUG] debug message');
    expect(content).not.toContain('[INFO] info message');
    expect(content).toContain('[WARN] warn message');
  });

  test('allows warn and error logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'warn' });

    await logger.warn('warn message');
    await logger.error('error message');

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[WARN] warn message');
    expect(content).toContain('[ERROR] error message');
  });
});

describe('Logger with minLevel: error', () => {
  test('suppresses debug, info, and warn logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'error' });

    await logger.debug('debug message');
    await logger.info('info message');
    await logger.warn('warn message');
    await logger.error('error message');

    const content = fs.getFileContents('/test.log');
    expect(content).not.toContain('[DEBUG] debug message');
    expect(content).not.toContain('[INFO] info message');
    expect(content).not.toContain('[WARN] warn message');
    expect(content).toContain('[ERROR] error message');
  });

  test('allows only error logs', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'error' });

    await logger.error('error message');

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[ERROR] error message');
  });
});

describe('Logger edge cases', () => {
  test('log at exactly the minimum level passes through', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'warn' });

    await logger.warn('warn at boundary');

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[WARN] warn at boundary');
  });

  test('logs with context are formatted correctly', async () => {
    const fs = new FakeFilesystem();
    const logger = new Logger(fs, '/test.log', { minLevel: 'info' });

    await logger.info('test message', { key: 'value' });

    const content = fs.getFileContents('/test.log');
    expect(content).toContain('[INFO] test message');
    expect(content).toContain('{"key":"value"}');
  });
});
