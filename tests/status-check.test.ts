// Tests for status-check modules

import { describe, it, expect } from 'vitest';
import { checkPhaseStatus } from '../src/status-check.js';
import { findLatestPhaseDir } from '../src/status-check-finder.js';
import { parsePhaseStatus } from '../src/status-check-parser.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';
import type { Logger } from '../src/log.js';

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();
  private dirs = new Set<string>();
  private stats = new Map<string, FilesystemStats>();

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

  async mkdir(path: string, options?: { recursive: boolean }): Promise<void> {
    this.dirs.add(path);
  }

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
    return this.dirs.has(path) || this.files.has(path);
  }

  async readdir(path: string): Promise<string[]> {
    if (!this.dirs.has(path)) throw new Error(`ENOENT: ${path}`);
    const entries: string[] = [];
    for (const dir of this.dirs) {
      if (dir.startsWith(path + '/')) {
        const relative = dir.slice(path.length + 1);
        if (!relative.includes('/')) entries.push(relative);
      }
    }
    return entries;
  }

  async stat(path: string): Promise<FilesystemStats> {
    const stat = this.stats.get(path);
    if (!stat) throw new Error(`ENOENT: ${path}`);
    return stat;
  }

  setDirectory(path: string, mtime: number): void {
    this.dirs.add(path);
    this.stats.set(path, { isDirectory: () => true, mtimeMs: mtime });
  }

  setFile(path: string, content: string, mtime: number): void {
    this.files.set(path, content);
    this.stats.set(path, { isDirectory: () => false, mtimeMs: mtime });
  }
}

class FakeLogger implements Logger {
  async info(message: string, meta?: unknown): Promise<void> {}
  async warn(message: string, meta?: unknown): Promise<void> {}
  async error(message: string, meta?: unknown): Promise<void> {}
}

describe('parsePhaseStatus', () => {
  it('parses valid YAML with phase.status', () => {
    const yaml = 'phase:\n  id: "0001"\n  status: planning\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: true, status: 'planning' });
  });

  it('returns error for invalid YAML syntax', () => {
    const yaml = 'phase:\n  invalid: [unclosed';
    const result = parsePhaseStatus(yaml);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('YAML parsing failed');
  });

  it('returns error for missing phase field', () => {
    const yaml = 'steps:\n  - id: S001\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: false, error: 'YAML missing phase.status field' });
  });

  it('returns error for missing phase.status field', () => {
    const yaml = 'phase:\n  id: "0001"\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: false, error: 'YAML missing phase.status field' });
  });

  it('returns error when phase.status is not a string', () => {
    const yaml = 'phase:\n  status: 123\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: false, error: 'phase.status is not a string' });
  });

  it('returns error when phase is null', () => {
    const yaml = 'phase: null\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: false, error: 'YAML missing phase.status field' });
  });

  it('returns error when phase is not an object', () => {
    const yaml = 'phase: "string"\n';
    const result = parsePhaseStatus(yaml);
    expect(result).toEqual({ ok: false, error: 'YAML missing phase.status field' });
  });
});

describe('findLatestPhaseDir', () => {
  it('finds latest phase directory by modification time', async () => {
    const fs = new FakeFilesystem();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-first', 1000);
    fs.setDirectory('/project/.ushabti/phases/0002-second', 3000);
    fs.setDirectory('/project/.ushabti/phases/0003-third', 2000);

    const result = await findLatestPhaseDir('/project', fs);
    expect(result).toEqual({ ok: true, status: '/project/.ushabti/phases/0002-second' });
  });

  it('returns error when phases directory does not exist', async () => {
    const fs = new FakeFilesystem();
    const result = await findLatestPhaseDir('/project', fs);
    expect(result).toEqual({ ok: false, error: 'phases directory does not exist' });
  });

  it('returns error when phases directory is empty', async () => {
    const fs = new FakeFilesystem();
    fs.setDirectory('/project/.ushabti/phases', 0);
    const result = await findLatestPhaseDir('/project', fs);
    expect(result).toEqual({ ok: false, error: 'no phase directories found' });
  });

  it('ignores files in phases directory', async () => {
    const fs = new FakeFilesystem();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setFile('/project/.ushabti/phases/readme.txt', 'docs', 5000);
    fs.setDirectory('/project/.ushabti/phases/0001-phase', 2000);

    const result = await findLatestPhaseDir('/project', fs);
    expect(result).toEqual({ ok: true, status: '/project/.ushabti/phases/0001-phase' });
  });

  it('handles single phase directory', async () => {
    const fs = new FakeFilesystem();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-only', 1000);

    const result = await findLatestPhaseDir('/project', fs);
    expect(result).toEqual({ ok: true, status: '/project/.ushabti/phases/0001-only' });
  });
});

describe('checkPhaseStatus', () => {
  it('returns phase status on success', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-test', 1000);
    fs.setFile('/project/.ushabti/phases/0001-test/progress.yaml', 'phase:\n  status: building\n', 1000);

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result).toEqual({ ok: true, status: 'building' });
  });

  it('returns error when phases directory missing', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result).toEqual({ ok: false, error: 'phases directory does not exist' });
  });

  it('returns error when progress.yaml missing', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-test', 1000);

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('ENOENT');
  });

  it('returns error when progress.yaml has invalid YAML', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-test', 1000);
    fs.setFile('/project/.ushabti/phases/0001-test/progress.yaml', 'invalid: [yaml', 1000);

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('YAML parsing failed');
  });

  it('returns error when progress.yaml missing phase.status', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-test', 1000);
    fs.setFile('/project/.ushabti/phases/0001-test/progress.yaml', 'phase:\n  id: "0001"\n', 1000);

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result).toEqual({ ok: false, error: 'YAML missing phase.status field' });
  });

  it('returns error when phase.status is not a string', async () => {
    const fs = new FakeFilesystem();
    const logger = new FakeLogger();
    fs.setDirectory('/project/.ushabti/phases', 0);
    fs.setDirectory('/project/.ushabti/phases/0001-test', 1000);
    fs.setFile('/project/.ushabti/phases/0001-test/progress.yaml', 'phase:\n  status: 123\n', 1000);

    const result = await checkPhaseStatus('/project', fs, logger);
    expect(result).toEqual({ ok: false, error: 'phase.status is not a string' });
  });
});
