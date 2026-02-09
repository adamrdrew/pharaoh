// Tests for index.ts version reading logic

import { describe, test, expect } from 'vitest';
import { readVersion } from '../src/version.js';
import type { Filesystem } from '../src/status.js';

/**
 * Fake filesystem for testing
 * Implements Filesystem interface without touching real filesystem (L08)
 */
class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

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

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }
}

describe('readVersion', () => {
  test('returns version from valid package.json', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    fs.setFile('/test/project/package.json', JSON.stringify({ version: '1.2.3' }));

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('1.2.3');
  });

  test('returns "unknown" when package.json does not exist', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    // No package.json file set

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('unknown');
  });

  test('returns "unknown" when package.json contains malformed JSON', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    fs.setFile('/test/project/package.json', '{ invalid json }');

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('unknown');
  });

  test('returns "unknown" when package.json exists but has no version field', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    fs.setFile('/test/project/package.json', JSON.stringify({ name: 'test' }));

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('unknown');
  });

  test('returns "unknown" when package.json has version field set to empty string', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    fs.setFile('/test/project/package.json', JSON.stringify({ version: '' }));

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('unknown');
  });

  test('returns version when package.json has additional fields', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    fs.setFile(
      '/test/project/package.json',
      JSON.stringify({
        name: 'pharaoh',
        version: '0.1.0',
        description: 'test',
        dependencies: {},
      })
    );

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('0.1.0');
  });

  test('handles filesystem read errors gracefully', async () => {
    // Arrange
    const fs = new FakeFilesystem();
    const cwd = '/test/project';
    // Filesystem will throw error when trying to read non-existent file

    // Act
    const version = await readVersion(fs, cwd);

    // Assert
    expect(version).toBe('unknown');
  });
});
