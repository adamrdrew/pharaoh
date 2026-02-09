// Shutdown and signal handling
import process from 'node:process';
export function registerShutdownHandlers(deps) {
    const shutdown = createShutdownHandler(deps);
    process.on('SIGTERM', () => void shutdown());
    process.on('SIGINT', () => void shutdown());
    process.on('uncaughtException', (error) => void handleUncaught(deps, error));
    process.on('unhandledRejection', (reason) => void handleRejection(deps, reason));
}
function createShutdownHandler(deps) {
    return async () => {
        await deps.logger.info('Shutting down gracefully');
        await deps.watcher.stop();
        await deps.status.remove();
        await deps.logger.info('Shutdown complete');
        process.exit(0);
    };
}
async function handleUncaught(deps, error) {
    await deps.logger.error('Uncaught exception', {
        message: error.message,
        stack: error.stack,
    });
    await createShutdownHandler(deps)();
}
async function handleRejection(deps, reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    await deps.logger.error('Unhandled rejection', { message });
    await createShutdownHandler(deps)();
}
//# sourceMappingURL=shutdown.js.map