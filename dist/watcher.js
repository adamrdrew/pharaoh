// Dispatch directory watcher
import { checkFileExists, parseAndValidate, reportPhaseComplete } from './watcher-helpers.js';
import { createWatcher } from './watcher-setup.js';
/**
 * Watches dispatch directory for new markdown files
 */
export class DispatchWatcher {
    fs;
    logger;
    status;
    runner;
    dispatchPath;
    pid;
    started;
    watcher = null;
    busy = false;
    queue = [];
    constructor(fs, logger, status, runner, dispatchPath, pid, started) {
        this.fs = fs;
        this.logger = logger;
        this.status = status;
        this.runner = runner;
        this.dispatchPath = dispatchPath;
        this.pid = pid;
        this.started = started;
    }
    async start() {
        this.watcher = await createWatcher(this.dispatchPath, this.logger, (path) => {
            void this.handleDispatchFile(path);
        });
        await this.logger.info('Watcher started', { path: this.dispatchPath });
    }
    async stop() {
        if (this.watcher !== null) {
            await this.watcher.close();
            this.watcher = null;
            await this.logger.info('Watcher stopped');
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
        await this.logger.info('Dispatch file queued', { path });
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
        await this.logger.info('Processing dispatch file', { path });
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
        const result = await this.runner.runPhase(this.pid, this.started, parsed.body, parsed.phase);
        await reportPhaseComplete(ctx, parsed.phase, result);
    }
    buildContext() {
        return { fs: this.fs, logger: this.logger, status: this.status, pid: this.pid, started: this.started };
    }
}
//# sourceMappingURL=watcher.js.map