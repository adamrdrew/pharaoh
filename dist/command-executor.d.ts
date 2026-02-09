import type { CommandExecutor } from './git.js';
export declare class RealCommandExecutor implements CommandExecutor {
    execute(command: string, args: readonly string[]): Promise<{
        stdout: string;
        stderr: string;
        code: number;
    }>;
    exists(command: string): Promise<boolean>;
}
//# sourceMappingURL=command-executor.d.ts.map