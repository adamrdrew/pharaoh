// Git operations abstraction for phase workflow automation

export type GitResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface CommandExecutor {
  execute(command: string, args: readonly string[]): Promise<{ stdout: string; stderr: string; code: number }>;
  exists(command: string): Promise<boolean>;
}

export class GitOperations {
  constructor(private readonly executor: CommandExecutor) {}

  async isGitRepo(): Promise<GitResult<boolean>> {
    const result = await this.executor.execute('git', ['rev-parse', '--git-dir']);
    return result.code === 0 ? { ok: true, value: true } : { ok: true, value: false };
  }

  async isClean(): Promise<GitResult<boolean>> {
    const result = await this.executor.execute('git', ['status', '--porcelain']);
    return { ok: true, value: result.stdout.trim() === '' };
  }

  async getCurrentBranch(): Promise<GitResult<string>> {
    const result = await this.executor.execute('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return result.code === 0 ? { ok: true, value: result.stdout.trim() } : { ok: false, error: result.stderr };
  }

  async pull(): Promise<GitResult> {
    const result = await this.executor.execute('git', ['pull']);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }

  async createBranch(name: string): Promise<GitResult> {
    const result = await this.executor.execute('git', ['checkout', '-b', name]);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }

  async stageAll(): Promise<GitResult> {
    const result = await this.executor.execute('git', ['add', '-A']);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }

  async commit(message: string): Promise<GitResult> {
    const result = await this.executor.execute('git', ['commit', '-m', message]);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }

  async push(branch: string): Promise<GitResult> {
    const result = await this.executor.execute('git', ['push', '-u', 'origin', branch]);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }

  async openPR(title: string, body: string): Promise<GitResult> {
    const ghExists = await this.executor.exists('gh');
    if (!ghExists) return { ok: false, error: 'gh CLI not installed' };
    const result = await this.executor.execute('gh', ['pr', 'create', '--title', title, '--body', body]);
    return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
  }
}
