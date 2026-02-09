// Command execution abstraction for testability

import { spawn } from 'node:child_process';
import { which } from './which.js';
import type { CommandExecutor } from './git.js';

export class RealCommandExecutor implements CommandExecutor {
  async execute(command: string, args: readonly string[]): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve) => {
      const proc = spawn(command, [...args], { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });
      proc.on('close', (code) => { resolve({ stdout, stderr, code: code ?? 1 }); });
    });
  }

  async exists(command: string): Promise<boolean> {
    return which(command) !== null;
  }
}
