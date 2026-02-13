// Tests for PR description builder

import { describe, it, expect } from 'vitest';
import { buildPRDescription } from '../src/pr-description-builder.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';

class FakeFilesystem implements Filesystem {
  private files: Map<string, string> = new Map();

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async appendFile(path: string, content: string): Promise<void> {
    const existing = this.files.get(path) ?? '';
    this.files.set(path, existing + content);
  }

  async mkdir(path: string, options?: { recursive: boolean }): Promise<void> {}

  async rename(oldPath: string, newPath: string): Promise<void> {
    const content = this.files.get(oldPath);
    if (content) {
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

  async readdir(path: string): Promise<string[]> {
    return [];
  }

  async stat(path: string): Promise<FilesystemStats> {
    return { isDirectory: () => false, mtimeMs: 0 };
  }
}

describe('buildPRDescription', () => {
  it('returns rich description with intent, scope, and steps', async () => {
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test Phase

## Intent

This is a test phase to verify PR descriptions.

## Scope

**In scope:**
- Feature A
- Feature B

**Out of scope:**
- Feature C

## Acceptance criteria

1. Criterion 1
2. Criterion 2`;

    const stepsContent = `# Steps

## S001: First step

**Intent:** Do the first thing

## S002: Second step

**Intent:** Do the second thing`;

    fs.setFile('/project/.ushabti/phases/0001-test-phase/phase.md', phaseContent);
    fs.setFile('/project/.ushabti/phases/0001-test-phase/steps.md', stepsContent);
    const description = await buildPRDescription('/project', '0001-test-phase', fs);
    expect(description).toContain('## Summary');
    expect(description).toContain('This is a test phase to verify PR descriptions.');
    expect(description).toContain('## Scope');
    expect(description).toContain('Feature A');
    expect(description).toContain('## Steps Completed');
    expect(description).toContain('S001: First step');
    expect(description).toContain('S002: Second step');
  });

  it('returns fallback description when phase.md is missing', async () => {
    const fs = new FakeFilesystem();
    const description = await buildPRDescription('/project', '0001-test-phase', fs);
    expect(description).toBe('## Phase 0001-test-phase\n\nAutomated phase completion via Pharaoh.');
  });

  it('handles missing steps.md gracefully', async () => {
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test Phase

## Intent

Test phase with no steps file.

## Scope

Test scope.`;

    fs.setFile('/project/.ushabti/phases/0001-test-phase/phase.md', phaseContent);
    const description = await buildPRDescription('/project', '0001-test-phase', fs);
    expect(description).toContain('## Summary');
    expect(description).toContain('Test phase with no steps file.');
    expect(description).not.toContain('## Steps Completed');
  });

  it('handles empty intent section', async () => {
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test Phase

## Scope

Test scope.`;

    fs.setFile('/project/.ushabti/phases/0001-test-phase/phase.md', phaseContent);
    const description = await buildPRDescription('/project', '0001-test-phase', fs);
    expect(description).toContain('## Scope');
    expect(description).not.toContain('## Summary');
  });
});
