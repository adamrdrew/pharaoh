// Shutdown and signal handling

import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { DispatchWatcher } from './watcher.js';
import process from 'node:process';

export interface ShutdownDependencies {
  readonly logger: Logger;
  readonly status: StatusManager;
  readonly watcher: DispatchWatcher;
}

export function registerShutdownHandlers(deps: ShutdownDependencies): void {
  const shutdown = createShutdownHandler(deps);
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
  process.on('uncaughtException', (error: Error) => void handleUncaught(deps, error));
  process.on('unhandledRejection', (reason: unknown) => void handleRejection(deps, reason));
}

function createShutdownHandler(deps: ShutdownDependencies): () => Promise<void> {
  return async (): Promise<void> => {
    await deps.logger.info('Shutting down gracefully');
    await deps.watcher.stop();
    await deps.status.remove();
    await deps.logger.info('Shutdown complete');
    process.exit(0);
  };
}

async function handleUncaught(deps: ShutdownDependencies, error: Error): Promise<void> {
  await deps.logger.error('Uncaught exception', {
    message: error.message,
    stack: error.stack,
  });
  await createShutdownHandler(deps)();
}

async function handleRejection(deps: ShutdownDependencies, reason: unknown): Promise<void> {
  const message = reason instanceof Error ? reason.message : String(reason);
  await deps.logger.error('Unhandled rejection', { message });
  await createShutdownHandler(deps)();
}
