// Command execution abstraction for testability
import { spawn } from 'node:child_process';
import { which } from './which.js';
export class RealCommandExecutor {
    async execute(command, args) {
        return new Promise((resolve) => {
            const proc = spawn(command, [...args], { stdio: 'pipe' });
            let stdout = '';
            let stderr = '';
            proc.stdout.on('data', (data) => { stdout += data.toString(); });
            proc.stderr.on('data', (data) => { stderr += data.toString(); });
            proc.on('close', (code) => { resolve({ stdout, stderr, code: code ?? 1 }); });
        });
    }
    async exists(command) {
        return which(command) !== null;
    }
}
//# sourceMappingURL=command-executor.js.map