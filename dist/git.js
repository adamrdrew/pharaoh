// Git operations abstraction for phase workflow automation
export class GitOperations {
    executor;
    constructor(executor) {
        this.executor = executor;
    }
    async isGitRepo() {
        const result = await this.executor.execute('git', ['rev-parse', '--git-dir']);
        return result.code === 0 ? { ok: true, value: true } : { ok: true, value: false };
    }
    async isClean() {
        const result = await this.executor.execute('git', ['status', '--porcelain']);
        return { ok: true, value: result.stdout.trim() === '' };
    }
    async getCurrentBranch() {
        const result = await this.executor.execute('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
        return result.code === 0 ? { ok: true, value: result.stdout.trim() } : { ok: false, error: result.stderr };
    }
    async pull() {
        const result = await this.executor.execute('git', ['pull']);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
    async createBranch(name) {
        const result = await this.executor.execute('git', ['checkout', '-b', name]);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
    async stageAll() {
        const result = await this.executor.execute('git', ['add', '-A']);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
    async commit(message) {
        const result = await this.executor.execute('git', ['commit', '-m', message]);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
    async push(branch) {
        const result = await this.executor.execute('git', ['push', '-u', 'origin', branch]);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
    async openPR(title, body) {
        const ghExists = await this.executor.exists('gh');
        if (!ghExists)
            return { ok: false, error: 'gh CLI not installed' };
        const result = await this.executor.execute('gh', ['pr', 'create', '--title', title, '--body', body]);
        return result.code === 0 ? { ok: true, value: undefined } : { ok: false, error: result.stderr };
    }
}
//# sourceMappingURL=git.js.map