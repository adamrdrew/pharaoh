// Server dependency initialization
import process from 'node:process';
import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { PhaseRunner } from './runner.js';
import { DispatchWatcher } from './watcher.js';
import { GitOperations } from './git.js';
import { RealCommandExecutor } from './command-executor.js';
import { EventWriter } from './event-writer.js';
import { readVersions } from './version.js';
export async function initializeDependencies(fs, paths, config) {
    const versions = readVersions();
    const metadata = buildMetadata(versions, config, paths);
    const core = createCoreServices(fs, paths);
    const watcher = createDispatchWatcher(fs, core, paths, metadata);
    return { ...core, watcher, metadata };
}
function buildMetadata(versions, config, paths) {
    return { ...versions, model: config.model ?? 'claude-opus-4-20250514', cwd: paths.cwd };
}
function createCoreServices(fs, paths) {
    return { logger: new Logger(fs, paths.logPath), status: new StatusManager(fs, paths.statusPath) };
}
function createDispatchWatcher(fs, core, paths, metadata) {
    const runner = createPhaseRunner(fs, core, paths, metadata.model);
    const git = createGitOperations();
    const deps = { fs, logger: core.logger, status: core.status, runner, git };
    const options = { dispatchPath: paths.dispatchPath, pid: process.pid, started: new Date().toISOString(), metadata };
    return new DispatchWatcher(deps, options);
}
function createGitOperations() {
    return new GitOperations(new RealCommandExecutor());
}
function createPhaseRunner(fs, core, paths, model) {
    const eventWriter = new EventWriter(fs, paths.eventsPath);
    return new PhaseRunner(core.logger, core.status, { cwd: paths.cwd, model }, eventWriter, fs);
}
//# sourceMappingURL=server-deps.js.map