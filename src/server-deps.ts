// Server dependency initialization

import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import { GitOperations } from './git.js';
import { RealCommandExecutor } from './command-executor.js';
import type { Filesystem } from './status.js';

export interface ServerPaths {
  readonly cwd: string;
  readonly dispatchPath: string;
  readonly statusPath: string;
  readonly logPath: string;
}

export interface ServerConfig {
  readonly model?: string;
}

export async function initializeDependencies(
  fs: Filesystem,
  paths: ServerPaths,
  config: ServerConfig
): Promise<{ logger: Logger; status: StatusManager; watcher: DispatchWatcher }> {
  const core = createCoreServices(fs, paths);
  const watcher = createDispatchWatcher(fs, core, paths, config);
  return { ...core, watcher };
}

function createCoreServices(fs: Filesystem, paths: ServerPaths): { logger: Logger; status: StatusManager } {
  return { logger: new Logger(fs, paths.logPath), status: new StatusManager(fs, paths.statusPath) };
}

function createDispatchWatcher(fs: Filesystem, core: { logger: Logger; status: StatusManager }, paths: ServerPaths, config: ServerConfig): DispatchWatcher {
  const runner = createPhaseRunner(core, paths, config);
  const git = createGitOperations();
  const deps = { fs, logger: core.logger, status: core.status, runner, git };
  const options = { dispatchPath: paths.dispatchPath, pid: process.pid, started: new Date().toISOString() };
  return new DispatchWatcher(deps, options);
}

function createGitOperations(): GitOperations {
  return new GitOperations(new RealCommandExecutor());
}

function createPhaseRunner(core: { logger: Logger; status: StatusManager }, paths: ServerPaths, config: ServerConfig): PhaseRunner {
  return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, model: config.model ?? 'claude-opus-4-20250514' });
}
