// Server initialization and startup
import process from 'node:process';
import path from 'node:path';
import { RealFilesystem } from './filesystem.js';
import { registerShutdownHandlers } from './shutdown.js';
import { buildPaths } from './server-paths.js';
import { initializeDependencies } from './server-deps.js';
import { startServer } from './server-startup.js';
import { RealLockManager, RealPidChecker } from './lock-manager.js';
export async function serve(config) {
    const paths = buildPaths(process.cwd());
    const fs = new RealFilesystem();
    await prepareServer(fs, paths);
    await launchServer(fs, paths, config);
}
async function prepareServer(fs, paths) {
    await ensureDirectories(fs, paths);
    await acquireInstanceLock(fs, paths);
}
async function acquireInstanceLock(fs, paths) {
    const lock = new RealLockManager(fs, paths.lockPath, new RealPidChecker());
    const result = await lock.acquire();
    if (!result.ok)
        handleLockFailure(result.error);
}
function handleLockFailure(error) {
    console.error(`Failed to start: ${error.message}`);
    process.exit(1);
}
async function launchServer(fs, paths, config) {
    const dependencies = await initializeDependencies(fs, paths, config);
    registerShutdownHandlers(dependencies);
    await startServer(dependencies, paths);
}
async function ensureDirectories(fs, paths) {
    await fs.mkdir(path.join(paths.cwd, '.pharaoh'), { recursive: true });
    await fs.mkdir(paths.dispatchPath, { recursive: true });
}
//# sourceMappingURL=server.js.map