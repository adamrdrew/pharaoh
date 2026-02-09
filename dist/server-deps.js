// Server dependency initialization
import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import { GitOperations } from './git.js';
import { RealCommandExecutor } from './command-executor.js';
export async function initializeDependencies(fs, paths, config) {
    const core = createCoreServices(fs, paths);
    const watcher = createDispatchWatcher(fs, core, paths, config);
    return { ...core, watcher };
}
function createCoreServices(fs, paths) {
    return { logger: new Logger(fs, paths.logPath), status: new StatusManager(fs, paths.statusPath) };
}
function createDispatchWatcher(fs, core, paths, config) {
    const runner = createPhaseRunner(core, paths, config);
    const git = createGitOperations();
    const deps = { fs, logger: core.logger, status: core.status, runner, git };
    const options = { dispatchPath: paths.dispatchPath, pid: process.pid, started: new Date().toISOString() };
    return new DispatchWatcher(deps, options);
}
function createGitOperations() {
    return new GitOperations(new RealCommandExecutor());
}
function createPhaseRunner(core, paths, config) {
    return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, model: config.model ?? 'claude-opus-4-20250514' });
}
//# sourceMappingURL=server-deps.js.map