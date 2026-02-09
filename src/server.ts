// Server initialization and startup

import process from 'node:process';
import path from 'node:path';
import { RealFilesystem } from './filesystem.js';
import { registerShutdownHandlers } from './shutdown.js';
import { buildPaths } from './server-paths.js';
import { initializeDependencies } from './server-deps.js';
import { startServer } from './server-startup.js';
import type { Filesystem } from './status.js';
import type { ServerConfig, ServerPaths } from './server-deps.js';

export type { ServerConfig } from './server-deps.js';

export async function serve(config: ServerConfig): Promise<void> {
  const paths = buildPaths(process.cwd());
  const fs = new RealFilesystem();
  await prepareServer(fs, paths);
  await launchServer(fs, paths, config);
}

async function prepareServer(fs: Filesystem, paths: ServerPaths): Promise<void> {
  await ensureDirectories(fs, paths);
}

async function launchServer(fs: Filesystem, paths: ServerPaths, config: ServerConfig): Promise<void> {
  const dependencies = await initializeDependencies(fs, paths, config);
  registerShutdownHandlers(dependencies);
  await startServer(dependencies, paths);
}

async function ensureDirectories(fs: Filesystem, paths: ServerPaths): Promise<void> {
  await fs.mkdir(path.join(paths.cwd, '.pharaoh'), { recursive: true });
  await fs.mkdir(paths.dispatchPath, { recursive: true });
}
