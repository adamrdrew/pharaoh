// Watcher initialization

import chokidar, { type FSWatcher } from 'chokidar';
import type { Logger } from './log.js';

export async function createWatcher(
  dispatchPath: string,
  logger: Logger,
  onAdd: (path: string) => void
): Promise<FSWatcher> {
  const watcher = chokidar.watch(dispatchPath, {
    persistent: true,
    ignoreInitial: false,
    depth: 0,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });
  watcher.on('add', (path: string) => {
    if (path.endsWith('.md')) onAdd(path);
  });
  watcher.on('error', (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    void logger.error('Watcher error', { message, stack });
  });
  await new Promise<void>((resolve) => watcher.on('ready', () => resolve()));
  return watcher;
}
