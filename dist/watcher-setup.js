// Watcher initialization
import chokidar from 'chokidar';
export async function createWatcher(dispatchPath, logger, onAdd) {
    const watcher = chokidar.watch(dispatchPath, {
        persistent: true,
        ignoreInitial: false,
        depth: 0,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    });
    watcher.on('add', (path) => {
        if (path.endsWith('.md'))
            onAdd(path);
    });
    watcher.on('error', (error) => {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        void logger.error('Watcher error', { message, stack });
    });
    await new Promise((resolve) => watcher.on('ready', () => resolve()));
    return watcher;
}
//# sourceMappingURL=watcher-setup.js.map