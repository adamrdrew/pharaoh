// Server dependency initialization

import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import { GitOperations } from './git.js';
import { RealCommandExecutor } from './command-executor.js';
import { EventWriter } from './event-writer.js';
import { readVersions } from './version.js';
import type { Filesystem } from './status.js';
import type { Versions } from './version.js';
import type { LockManager } from './lock-manager.js';

export interface ServerPaths {
  readonly cwd: string;
  readonly dispatchPath: string;
  readonly statusPath: string;
  readonly logPath: string;
  readonly eventsPath: string;
  readonly lockPath: string;
}

export interface ServerConfig {
  readonly model?: string;
}

export interface ServerMetadata extends Versions {
  readonly model: string;
  readonly cwd: string;
}

export async function initializeDependencies(
  fs: Filesystem,
  paths: ServerPaths,
  config: ServerConfig,
  lock: LockManager
): Promise<{ logger: Logger; status: StatusManager; watcher: DispatchWatcher; metadata: ServerMetadata; git: GitOperations; lock: LockManager }> {
  const versions = readVersions();
  const metadata = buildMetadata(versions, config, paths);
  const core = createCoreServices(fs, paths);
  const git = createGitOperations();
  const watcher = createDispatchWatcher(fs, core, paths, metadata, git, lock);
  return { ...core, watcher, metadata, git, lock };
}

function buildMetadata(versions: Versions, config: ServerConfig, paths: ServerPaths): ServerMetadata {
  return { ...versions, model: config.model ?? 'claude-opus-4-20250514', cwd: paths.cwd };
}

function createCoreServices(fs: Filesystem, paths: ServerPaths): { logger: Logger; status: StatusManager } {
  return { logger: new Logger(fs, paths.logPath), status: new StatusManager(fs, paths.statusPath) };
}


function createDispatchWatcher(fs: Filesystem, core: { logger: Logger; status: StatusManager }, paths: ServerPaths, metadata: ServerMetadata, git: GitOperations, lock: LockManager): DispatchWatcher {
  const runner = createPhaseRunner(fs, core, paths, metadata.model, lock);
  const deps = { fs, logger: core.logger, status: core.status, runner, git, lock };
  const options = { dispatchPath: paths.dispatchPath, pid: process.pid, started: new Date().toISOString(), metadata };
  return new DispatchWatcher(deps, options);
}

function createGitOperations(): GitOperations {
  return new GitOperations(new RealCommandExecutor());
}

function createPhaseRunner(fs: Filesystem, core: { logger: Logger; status: StatusManager }, paths: ServerPaths, model: string, lock: LockManager): PhaseRunner {
  const eventWriter = new EventWriter(fs, paths.eventsPath);
  return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, model }, eventWriter, fs, lock);
}
