// Server startup sequence
import process from 'node:process';
import { RealFilesystem } from './filesystem.js';
import { readVersion } from './version.js';
export async function startServer(deps, paths) {
    await logServerStartup(deps, paths);
    await initializeServerState(deps.status, deps.metadata);
    await launchWatcher(deps, paths);
}
async function logServerStartup(deps, paths) {
    const fs = new RealFilesystem();
    const version = await readVersion(fs, paths.cwd);
    await deps.logger.info('Pharaoh server starting', { pid: process.pid, cwd: paths.cwd });
    await deps.logger.info('Pharaoh starting', { version, cwd: paths.cwd });
}
async function initializeServerState(status, metadata) {
    await status.setIdle({ pid: process.pid, started: new Date().toISOString(), ...metadata, phasesCompleted: 0 });
}
async function launchWatcher(deps, paths) {
    await deps.logger.info('Serving directory', { cwd: paths.cwd, dispatchPath: paths.dispatchPath });
    await deps.watcher.start();
    await deps.logger.info('Pharaoh server ready', { dispatchPath: paths.dispatchPath });
}
//# sourceMappingURL=server-startup.js.map