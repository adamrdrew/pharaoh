// Tests for git-post-phase module

import { describe, it, expect } from 'vitest';
import { finalizeGreenPhase } from '../src/git-post-phase.js';
import type { GitOperations, GitResult, CommandExecutor } from '../src/git.js';
import type { Logger } from '../src/log.js';
import type { Filesystem, FilesystemStats } from '../src/status.js';

class FakeCommandExecutor implements CommandExecutor {
  private responses: Map<string, { stdout: string; stderr: string; code: number }> = new Map();
  private commandExists: Set<string> = new Set();

  setResponse(key: string, stdout: string, stderr: string, code: number): void {
    this.responses.set(key, { stdout, stderr, code });
  }

  setCommandExists(command: string): void {
    this.commandExists.add(command);
  }

  async execute(command: string, args: readonly string[]): Promise<{ stdout: string; stderr: string; code: number }> {
    const key = `${command} ${args.join(' ')}`;
    const response = this.responses.get(key) ?? { stdout: '', stderr: '', code: 0 };
    return response;
  }

  async exists(command: string): Promise<boolean> {
    return this.commandExists.has(command);
  }
}

class FakeGitOperations implements GitOperations {
  public isGitRepoCalled = false;
  public openPRCalled = false;
  public lastPRTitle: string | null = null;
  public lastPRBody: string | null = null;
  private prUrl: string | null = 'https://github.com/user/repo/pull/42';

  setPRUrl(url: string | null): void {
    this.prUrl = url;
  }

  async isGitRepo(): Promise<GitResult<boolean>> {
    this.isGitRepoCalled = true;
    return { ok: true, value: true };
  }

  async isClean(): Promise<GitResult<boolean>> {
    return { ok: true, value: true };
  }

  async getCurrentBranch(): Promise<GitResult<string>> {
    return { ok: true, value: 'main' };
  }

  async pull(): Promise<GitResult> {
    return { ok: true, value: undefined };
  }

  async createBranch(name: string): Promise<GitResult> {
    return { ok: true, value: undefined };
  }

  async stageAll(): Promise<GitResult> {
    return { ok: true, value: undefined };
  }

  async commit(message: string): Promise<GitResult> {
    return { ok: true, value: undefined };
  }

  async push(branch: string): Promise<GitResult> {
    return { ok: true, value: undefined };
  }

  async openPR(title: string, body: string): Promise<GitResult<string>> {
    this.openPRCalled = true;
    this.lastPRTitle = title;
    this.lastPRBody = body;
    if (this.prUrl) return { ok: true, value: this.prUrl };
    return { ok: false, error: 'PR creation failed' };
  }
}

class FakeLogger implements Logger {
  async info(_message: string, _meta?: unknown): Promise<void> {}
  async warn(_message: string, _meta?: unknown): Promise<void> {}
  async error(_message: string, _meta?: unknown): Promise<void> {}
  async debug(_message: string, _meta?: unknown): Promise<void> {}
}

class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

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

describe('finalizeGreenPhase', () => {
  it('returns PR URL when PR is successfully created', async () => {
    const git = new FakeGitOperations();
    const logger = new FakeLogger();
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test\n\n## Intent\n\nTest phase\n\n## Scope\n\nTest`;
    fs.setFile('/project/.ushabti/phases/0001-test/phase.md', phaseContent);
    const prUrl = await finalizeGreenPhase(git, logger, '0001-test', fs, '/project');
    expect(prUrl).toBe('https://github.com/user/repo/pull/42');
    expect(git.openPRCalled).toBe(true);
  });

  it('returns null when PR creation fails', async () => {
    const git = new FakeGitOperations();
    git.setPRUrl(null);
    const logger = new FakeLogger();
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test\n\n## Intent\n\nTest phase\n\n## Scope\n\nTest`;
    fs.setFile('/project/.ushabti/phases/0001-test/phase.md', phaseContent);
    const prUrl = await finalizeGreenPhase(git, logger, '0001-test', fs, '/project');
    expect(prUrl).toBeNull();
  });

  it('uses rich PR description from buildPRDescription', async () => {
    const git = new FakeGitOperations();
    const logger = new FakeLogger();
    const fs = new FakeFilesystem();
    const phaseContent = `# Phase 0001: Test Phase\n\n## Intent\n\nTest intent\n\n## Scope\n\nTest scope`;
    fs.setFile('/project/.ushabti/phases/0001-test/phase.md', phaseContent);
    await finalizeGreenPhase(git, logger, '0001-test', fs, '/project');
    expect(git.lastPRBody).toContain('## Summary');
    expect(git.lastPRBody).toContain('Test intent');
  });

  it('returns null when not in a git repo', async () => {
    const git = new FakeGitOperations();
    git.isGitRepoCalled = false;
    const realIsGitRepo = git.isGitRepo.bind(git);
    git.isGitRepo = async () => {
      git.isGitRepoCalled = true;
      return { ok: true, value: false };
    };
    const logger = new FakeLogger();
    const fs = new FakeFilesystem();
    const prUrl = await finalizeGreenPhase(git, logger, '0001-test', fs, '/project');
    expect(prUrl).toBeNull();
    expect(git.isGitRepoCalled).toBe(true);
  });
});
