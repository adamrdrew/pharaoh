// Tests for GitOperations

import { describe, it, expect } from 'vitest';
import { GitOperations } from '../src/git.js';
import type { CommandExecutor } from '../src/git.js';

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
    const response = this.responses.get(key);
    if (!response) throw new Error(`No fake response for: ${key}`);
    return response;
  }

  async exists(command: string): Promise<boolean> {
    return this.commandExists.has(command);
  }
}

describe('GitOperations.openPR', () => {
  it('extracts PR URL from gh CLI stdout', async () => {
    const executor = new FakeCommandExecutor();
    executor.setCommandExists('gh');
    executor.setResponse('gh pr create --title Test PR --body Test body', 'https://github.com/user/repo/pull/42\n', '', 0);
    const git = new GitOperations(executor);
    const result = await git.openPR('Test PR', 'Test body');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('https://github.com/user/repo/pull/42');
    }
  });

  it('returns error when gh CLI is not installed', async () => {
    const executor = new FakeCommandExecutor();
    const git = new GitOperations(executor);
    const result = await git.openPR('Test PR', 'Test body');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('gh CLI not installed');
    }
  });

  it('returns error when gh pr create fails', async () => {
    const executor = new FakeCommandExecutor();
    executor.setCommandExists('gh');
    executor.setResponse('gh pr create --title Test PR --body Test body', '', 'PR creation failed', 1);
    const git = new GitOperations(executor);
    const result = await git.openPR('Test PR', 'Test body');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('PR creation failed');
    }
  });

  it('handles multiline stdout by extracting last line', async () => {
    const executor = new FakeCommandExecutor();
    executor.setCommandExists('gh');
    executor.setResponse('gh pr create --title Test PR --body Test body', 'Creating pull request...\nUpdating refs...\nhttps://github.com/user/repo/pull/99', '', 0);
    const git = new GitOperations(executor);
    const result = await git.openPR('Test PR', 'Test body');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('https://github.com/user/repo/pull/99');
    }
  });
});
