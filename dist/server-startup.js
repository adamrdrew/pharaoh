// Server startup sequence
import process from 'node:process';
import { RealFilesystem } from './filesystem.js';
import { readVersion } from './version.js';
export async function startServer(deps, paths) {
    await logServerStartup(deps, paths);
    const gitBranch = await queryGitBranch(deps.git);
    await initializeServerState(deps.status, deps.metadata, gitBranch);
    await launchWatcher(deps, paths);
}
async function logServerStartup(deps, paths) {
    const fs = new RealFilesystem();
    const version = await readVersion(fs, paths.cwd);
    await deps.logger.info('Pharaoh server starting', { pid: process.pid, cwd: paths.cwd });
    await deps.logger.info('Pharaoh starting', { version, cwd: paths.cwd });
}
async function queryGitBranch(git) {
    const result = await git.getCurrentBranch();
    return result.ok ? result.value : undefined;
}
async function initializeServerState(status, metadata, gitBranch) {
    await status.setIdle({ pid: process.pid, started: new Date().toISOString(), ...metadata, phasesCompleted: 0, gitBranch });
}
async function launchWatcher(deps, paths) {
    await deps.logger.info('Serving directory', { cwd: paths.cwd, dispatchPath: paths.dispatchPath });
    await deps.watcher.start();
    await deps.logger.info('Pharaoh server ready', { dispatchPath: paths.dispatchPath });
}
//# sourceMappingURL=server-startup.js.map