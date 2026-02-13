// Server startup sequence

import process from 'node:process';
import { RealFilesystem } from './filesystem.js';
import { readVersion } from './version.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { DispatchWatcher } from './watcher.js';
import type { GitOperations } from './git.js';
import type { ServerPaths, ServerMetadata } from './server-deps.js';

export async function startServer(deps: { logger: Logger; status: StatusManager; watcher: DispatchWatcher; metadata: ServerMetadata; git: GitOperations }, paths: ServerPaths): Promise<void> {
  await logServerStartup(deps, paths);
  const gitBranch = await queryGitBranch(deps.git);
  await initializeServerState(deps.status, deps.metadata, gitBranch);
  await launchWatcher(deps, paths);
}

async function logServerStartup(deps: { logger: Logger; status: StatusManager; watcher: DispatchWatcher }, paths: ServerPaths): Promise<void> {
  const fs = new RealFilesystem();
  const version = await readVersion(fs, paths.cwd);
  await deps.logger.info('Pharaoh server starting', { pid: process.pid, cwd: paths.cwd });
  await deps.logger.info('Pharaoh starting', { version, cwd: paths.cwd });
}

async function queryGitBranch(git: GitOperations): Promise<string | undefined> {
  const result = await git.getCurrentBranch();
  return result.ok ? result.value : undefined;
}

async function initializeServerState(status: StatusManager, metadata: ServerMetadata, gitBranch: string | undefined): Promise<void> {
  await status.setIdle({ pid: process.pid, started: new Date().toISOString(), ...metadata, phasesCompleted: 0, gitBranch });
}

async function launchWatcher(deps: { logger: Logger; watcher: DispatchWatcher }, paths: ServerPaths): Promise<void> {
  await deps.logger.info('Serving directory', { cwd: paths.cwd, dispatchPath: paths.dispatchPath });
  await deps.watcher.start();
  await deps.logger.info('Pharaoh server ready', { dispatchPath: paths.dispatchPath });
}
