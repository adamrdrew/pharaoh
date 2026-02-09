// Server dependency initialization
import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
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
    return new DispatchWatcher(fs, core.logger, core.status, runner, paths.dispatchPath, process.pid, new Date().toISOString());
}
function createPhaseRunner(core, paths, config) {
    return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, pluginPath: config.pluginPath, model: config.model ?? 'claude-opus-4-20250514' });
}
//# sourceMappingURL=server-deps.js.map