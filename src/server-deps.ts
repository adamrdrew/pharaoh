// Server dependency initialization

import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import type { Filesystem } from './status.js';

export interface ServerPaths {
  readonly cwd: string;
  readonly dispatchPath: string;
  readonly statusPath: string;
  readonly logPath: string;
}

export interface ServerConfig {
  readonly pluginPath: string;
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
  return new DispatchWatcher(fs, core.logger, core.status, runner, paths.dispatchPath, process.pid, new Date().toISOString());
}

function createPhaseRunner(core: { logger: Logger; status: StatusManager }, paths: ServerPaths, config: ServerConfig): PhaseRunner {
  return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, pluginPath: config.pluginPath, model: config.model ?? 'claude-opus-4-20250514' });
}
