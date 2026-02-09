#!/usr/bin/env node

// CLI entry point for Pharaoh server

import process from 'node:process';
import path from 'node:path';
import { RealFilesystem } from './filesystem.js';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import type { Filesystem } from './status.js';

/**
 * Parse CLI arguments
 */
function parseArgs(): { command: string } {
  const args = process.argv.slice(2);
  const command = args[0] ?? '';
  return { command };
}

/**
 * Read version from package.json
 * Returns the version string if found, or "unknown" if the file cannot be read,
 * is malformed, or does not contain a version field.
 */
export async function readVersion(
  fs: Filesystem,
  cwd: string
): Promise<string> {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath);
    const packageJson = JSON.parse(packageJsonContent) as { version?: string };
    if (packageJson.version) {
      return packageJson.version;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Main server function
 */
async function serve(): Promise<void> {
  const cwd = process.cwd();
  const pid = process.pid;
  const started = new Date().toISOString();

  const dispatchPath = path.join(cwd, '.ushabti', 'dispatch');
  const statusPath = path.join(cwd, '.ushabti', 'service.json');
  const logPath = path.join(cwd, '.ushabti', 'service.log');
  const pluginPath = '/Users/adam/Development/ushabti/';
  const model = 'claude-opus-4-20250514';

  const fs = new RealFilesystem();
  const logger = new Logger(fs, logPath);
  const status = new StatusManager(fs, statusPath);
  const runner = new PhaseRunner(logger, status, {
    cwd,
    pluginPath,
    model,
  });

  // Read version from package.json
  const version = await readVersion(fs, cwd);

  const watcher = new DispatchWatcher(
    fs,
    logger,
    status,
    runner,
    dispatchPath,
    pid,
    started
  );

  const shutdown = async (): Promise<void> => {
    await logger.info('Shutting down gracefully');
    await watcher.stop();
    await status.remove();
    await logger.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown();
  });

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('uncaughtException', (error: Error) => {
    void logger.error('Uncaught exception', {
      message: error.message,
      stack: error.stack,
    });
    void shutdown();
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    void logger.error('Unhandled rejection', { message });
    void shutdown();
  });

  await logger.info('Pharaoh server starting', { pid, cwd });
  await status.setIdle(pid, started);
  await logger.info('Pharaoh starting', { version, cwd });
  await logger.info('Serving directory', { cwd, dispatchPath });
  await watcher.start();
  await logger.info('Pharaoh server ready', { dispatchPath });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const { command } = parseArgs();

  if (command === 'serve') {
    await serve();
  } else {
    // Bootstrap exception: console.error is acceptable here because this error
    // occurs during CLI argument parsing, before any dependencies (including
    // the logger) are initialized. Using console.error ensures the user sees
    // the usage message regardless of filesystem or configuration state.
    console.error('Usage: pharaoh serve');
    process.exit(1);
  }
}

// Only run main() when this module is executed directly (not imported)
// This allows tests to import readVersion without executing the server
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
