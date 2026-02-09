export type GitResult<T = void> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export interface CommandExecutor {
    execute(command: string, args: readonly string[]): Promise<{
        stdout: string;
        stderr: string;
        code: number;
    }>;
    exists(command: string): Promise<boolean>;
}
export declare class GitOperations {
    private readonly executor;
    constructor(executor: CommandExecutor);
    isGitRepo(): Promise<GitResult<boolean>>;
    isClean(): Promise<GitResult<boolean>>;
    getCurrentBranch(): Promise<GitResult<string>>;
    pull(): Promise<GitResult>;
    createBranch(name: string): Promise<GitResult>;
    stageAll(): Promise<GitResult>;
    commit(message: string): Promise<GitResult>;
    push(branch: string): Promise<GitResult>;
    openPR(title: string, body: string): Promise<GitResult>;
}
//# sourceMappingURL=git.d.ts.map