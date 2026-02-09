// Dispatch directory watcher

import chokidar, { type FSWatcher } from 'chokidar';
import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { PhaseRunner } from './runner.js';
import { parseDispatchFile } from './parser.js';

/**
 * Watches dispatch directory for new markdown files
 */
export class DispatchWatcher {
  private watcher: FSWatcher | null = null;
  private busy: boolean = false;
  private queue: string[] = [];

  constructor(
    private readonly fs: Filesystem,
    private readonly logger: Logger,
    private readonly status: StatusManager,
    private readonly runner: PhaseRunner,
    private readonly dispatchPath: string,
    private readonly pid: number,
    private readonly started: string
  ) {}

  /**
   * Start watching dispatch directory
   */
  async start(): Promise<void> {
    this.watcher = chokidar.watch(this.dispatchPath, {
      persistent: true,
      ignoreInitial: false,
      depth: 0,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    this.watcher.on('add', (path: string) => {
      if (path.endsWith('.md')) {
        void this.handleDispatchFile(path);
      }
    });

    this.watcher.on('error', (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      void this.logger.error('Watcher error', { message, stack });
    });

    await new Promise<void>((resolve) => {
      this.watcher?.on('ready', () => resolve());
    });

    await this.logger.info('Watcher started', { path: this.dispatchPath });
  }

  /**
   * Stop watching and clean up resources
   */
  async stop(): Promise<void> {
    if (this.watcher !== null) {
      await this.watcher.close();
      this.watcher = null;
      await this.logger.info('Watcher stopped');
    }
  }

  /**
   * Handle a new dispatch file
   */
  private async handleDispatchFile(path: string): Promise<void> {
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
  private async processQueue(): Promise<void> {
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
  private async processDispatchFile(path: string): Promise<void> {
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

    const result = await this.runner.runPhase(
      this.pid,
      this.started,
      parseResult.file.body,
      parseResult.file.phase
    );

    const phaseStarted = new Date().toISOString();
    const phaseCompleted = new Date().toISOString();
    const phaseName = parseResult.file.phase ?? 'unnamed-phase';

    if (result.ok) {
      await this.status.setDone(
        this.pid,
        this.started,
        phaseName,
        phaseStarted,
        phaseCompleted,
        result.costUsd,
        result.turns
      );
      await this.logger.info('Phase done', { phase: phaseName });
    } else {
      await this.status.setBlocked(
        this.pid,
        this.started,
        phaseName,
        phaseStarted,
        phaseCompleted,
        result.error,
        result.costUsd,
        result.turns
      );
      await this.logger.error('Phase blocked', {
        phase: phaseName,
        error: result.error,
      });
    }

    this.busy = false;
    await this.status.setIdle(this.pid, this.started);
  }
}
