// Dispatch directory watcher
import { checkFileExists, parseAndValidate, reportPhaseComplete } from './watcher-helpers.js';
import { createWatcher } from './watcher-setup.js';
import { prepareGitEnvironment } from './git-pre-phase.js';
import { finalizeGreenPhase } from './git-post-phase.js';
export class DispatchWatcher {
    deps;
    options;
    watcher = null;
    busy = false;
    queue = [];
    constructor(deps, options) {
        this.deps = deps;
        this.options = options;
    }
    async start() {
        this.watcher = await createWatcher(this.options.dispatchPath, this.deps.logger, (path) => {
            void this.handleDispatchFile(path);
        });
        await this.deps.logger.info('Watcher started', { path: this.options.dispatchPath });
    }
    async stop() {
        if (this.watcher !== null) {
            await this.watcher.close();
            this.watcher = null;
            await this.deps.logger.info('Watcher stopped');
        }
    }
    async handleDispatchFile(path) {
        if (this.busy)
            return this.enqueueFile(path);
        await this.processDispatchFile(path);
        await this.processQueue();
    }
    async enqueueFile(path) {
        this.queue.push(path);
        await this.deps.logger.info('Dispatch file queued', { path });
    }
    async processQueue() {
        while (this.queue.length > 0) {
            await this.processNextInQueue();
        }
    }
    async processNextInQueue() {
        const path = this.queue.shift();
        if (path !== undefined)
            await this.processDispatchFile(path);
    }
    async processDispatchFile(path) {
        this.busy = true;
        await this.deps.logger.info('Processing dispatch file', { path });
        await this.executeDispatchFile(path);
        this.busy = false;
    }
    async executeDispatchFile(path) {
        const ctx = this.buildContext();
        const parsed = await this.validateDispatchFile(ctx, path);
        if (!parsed.ok)
            return;
        await this.runAndReportPhase(ctx, parsed);
    }
    async validateDispatchFile(ctx, path) {
        const exists = await checkFileExists(ctx, path);
        if (!exists)
            return { ok: false };
        return parseAndValidate(ctx, path);
    }
    async runAndReportPhase(ctx, parsed) {
        await prepareGitEnvironment(this.deps.git, this.deps.logger, parsed.phase);
        const result = await this.deps.runner.runPhase(this.options.pid, this.options.started, parsed.body, parsed.phase);
        if (result.ok)
            await finalizeGreenPhase(this.deps.git, this.deps.logger, parsed.phase);
        await reportPhaseComplete(ctx, parsed.phase, result);
    }
    buildContext() {
        return { ...this.deps, pid: this.options.pid, started: this.options.started };
    }
}
//# sourceMappingURL=watcher.js.map