// Status manager for atomic pharaoh.json operations

import type { ServiceStatus } from './types.js';
import { readStatus, type ReadResult } from './status-reader.js';
import { writeStatus } from './status-writer.js';
import {
  buildIdleStatus,
  buildBusyStatus,
  buildDoneStatus,
  buildBlockedStatus,
} from './status-setters.js';
import type {
  SetIdleInput,
  SetBusyInput,
  SetDoneInput,
  SetBlockedInput,
} from './status-inputs.js';

export interface FilesystemStats {
  isDirectory(): boolean;
  mtimeMs: number;
}

export interface Filesystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  appendFile(path: string, content: string): Promise<void>;
  mkdir(path: string, options?: { recursive: boolean }): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FilesystemStats>;
  openExclusive(path: string, content: string): Promise<void>;
}

export type { ReadResult };
export type {
  SetIdleInput,
  SetBusyInput,
  SetDoneInput,
  SetBlockedInput,
} from './status-inputs.js';

/**
 * Manages pharaoh.json with atomic writes and state transitions
 */
export class StatusManager {
  constructor(
    private readonly fs: Filesystem,
    private readonly statusPath: string
  ) {}

  async write(status: ServiceStatus): Promise<void> {
    await writeStatus(this.fs, this.statusPath, status);
  }

  async read(): Promise<ReadResult> {
    return readStatus(this.fs, this.statusPath);
  }

  async remove(): Promise<void> {
    const exists = await this.fs.exists(this.statusPath);
    if (exists) await this.fs.unlink(this.statusPath);
  }

  async setIdle(input: SetIdleInput): Promise<void> {
    await this.write(buildIdleStatus(input));
  }

  async setBusy(input: SetBusyInput): Promise<void> {
    await this.write(buildBusyStatus(input));
  }

  async setDone(input: SetDoneInput): Promise<void> {
    await this.write(buildDoneStatus(input));
  }

  async setBlocked(input: SetBlockedInput): Promise<void> {
    await this.write(buildBlockedStatus(input));
  }
}
