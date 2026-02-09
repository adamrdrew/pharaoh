// Dispatch directory watcher
import chokidar from 'chokidar';
import { parseDispatchFile } from './parser.js';
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
    /**
     * Start watching dispatch directory
     */
    async start() {
        this.watcher = chokidar.watch(this.dispatchPath, {
            persistent: true,
            ignoreInitial: false,
            depth: 0,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100,
            },
        });
        this.watcher.on('add', (path) => {
            if (path.endsWith('.md')) {
                void this.handleDispatchFile(path);
            }
        });
        this.watcher.on('error', (error) => {
            const message = error instanceof Error ? error.message : String(error);
            const stack = error instanceof Error ? error.stack : undefined;
            void this.logger.error('Watcher error', { message, stack });
        });
        await new Promise((resolve) => {
            this.watcher?.on('ready', () => resolve());
        });
        await this.logger.info('Watcher started', { path: this.dispatchPath });
    }
    /**
     * Stop watching and clean up resources
     */
    async stop() {
        if (this.watcher !== null) {
            await this.watcher.close();
            this.watcher = null;
            await this.logger.info('Watcher stopped');
        }
    }
    /**
     * Handle a new dispatch file
     */
    async handleDispatchFile(path) {
        if (this.busy) {
            this.queue.push(path);
            await this.logger.info('Dispatch file queued', { path });
            return;
        }
        await this.processDispatchFile(path);
        await this.processQueue();
    }
    /**
     * Process queued dispatch files
     */
    async processQueue() {
        while (this.queue.length > 0) {
            const path = this.queue.shift();
            if (path !== undefined) {
                await this.processDispatchFile(path);
            }
        }
    }
    /**
     * Process a single dispatch file
     */
    async processDispatchFile(path) {
        this.busy = true;
        await this.logger.info('Processing dispatch file', { path });
        const exists = await this.fs.exists(path);
        if (!exists) {
            await this.logger.warn('Dispatch file disappeared', { path });
            this.busy = false;
            await this.status.setIdle(this.pid, this.started);
            return;
        }
        const content = await this.fs.readFile(path);
        const parseResult = parseDispatchFile(content);
        if (!parseResult.ok) {
            await this.logger.error('Failed to parse dispatch file', {
                path,
                error: parseResult.error,
            });
            await this.fs.unlink(path);
            this.busy = false;
            await this.status.setIdle(this.pid, this.started);
            return;
        }
        await this.fs.unlink(path);
        await this.logger.info('Dispatch file parsed', {
            path,
            phase: parseResult.file.phase,
            model: parseResult.file.model,
        });
        const result = await this.runner.runPhase(this.pid, this.started, parseResult.file.body, parseResult.file.phase);
        const phaseStarted = new Date().toISOString();
        const phaseCompleted = new Date().toISOString();
        const phaseName = parseResult.file.phase ?? 'unnamed-phase';
        if (result.ok) {
            await this.status.setDone(this.pid, this.started, phaseName, phaseStarted, phaseCompleted, result.costUsd, result.turns);
            await this.logger.info('Phase done', { phase: phaseName });
        }
        else {
            await this.status.setBlocked(this.pid, this.started, phaseName, phaseStarted, phaseCompleted, result.error, result.costUsd, result.turns);
            await this.logger.error('Phase blocked', {
                phase: phaseName,
                error: result.error,
            });
        }
        this.busy = false;
        await this.status.setIdle(this.pid, this.started);
    }
}
//# sourceMappingURL=watcher.js.map