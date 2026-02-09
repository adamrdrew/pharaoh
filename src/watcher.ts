// Dispatch directory watcher

import type { FSWatcher } from 'chokidar';
import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { PhaseRunner } from './runner.js';
import type { GitOperations } from './git.js';
import { checkFileExists, parseAndValidate, reportPhaseComplete } from './watcher-helpers.js';
import { createWatcher } from './watcher-setup.js';
import type { ProcessContext } from './watcher-context.js';
import { prepareGitEnvironment } from './git-pre-phase.js';
import { finalizeGreenPhase } from './git-post-phase.js';

export interface DispatchWatcherOptions {
  readonly dispatchPath: string;
  readonly pid: number;
  readonly started: string;
}

export interface DispatchWatcherDeps {
  readonly fs: Filesystem;
  readonly logger: Logger;
  readonly status: StatusManager;
  readonly runner: PhaseRunner;
  readonly git: GitOperations;
}

export class DispatchWatcher {
  private watcher: FSWatcher | null = null;
  private busy: boolean = false;
  private queue: string[] = [];
  constructor(private readonly deps: DispatchWatcherDeps, private readonly options: DispatchWatcherOptions) {}
  async start(): Promise<void> {
    this.watcher = await createWatcher(this.options.dispatchPath, this.deps.logger, (path) => {
      void this.handleDispatchFile(path);
    });
    await this.deps.logger.info('Watcher started', { path: this.options.dispatchPath });
  }
  async stop(): Promise<void> {
    if (this.watcher !== null) {
      await this.watcher.close();
      this.watcher = null;
      await this.deps.logger.info('Watcher stopped');
    }
  }
  private async handleDispatchFile(path: string): Promise<void> {
    if (this.busy) return this.enqueueFile(path);
    await this.processDispatchFile(path);
    await this.processQueue();
  }
  private async enqueueFile(path: string): Promise<void> {
    this.queue.push(path);
    await this.deps.logger.info('Dispatch file queued', { path });
  }
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      await this.processNextInQueue();
    }
  }
  private async processNextInQueue(): Promise<void> {
    const path = this.queue.shift();
    if (path !== undefined) await this.processDispatchFile(path);
  }
  private async processDispatchFile(path: string): Promise<void> {
    this.busy = true;
    await this.deps.logger.info('Processing dispatch file', { path });
    await this.executeDispatchFile(path);
    this.busy = false;
  }
  private async executeDispatchFile(path: string): Promise<void> {
    const ctx = this.buildContext();
    const parsed = await this.validateDispatchFile(ctx, path);
    if (!parsed.ok) return;
    await this.runAndReportPhase(ctx, parsed);
  }
  private async validateDispatchFile(ctx: ProcessContext, path: string): Promise<{ ok: true; phase: string; body: string } | { ok: false }> {
    const exists = await checkFileExists(ctx, path);
    if (!exists) return { ok: false };
    return parseAndValidate(ctx, path);
  }
  private async runAndReportPhase(ctx: ProcessContext, parsed: { phase: string; body: string }): Promise<void> {
    await prepareGitEnvironment(this.deps.git, this.deps.logger, parsed.phase);
    const result = await this.deps.runner.runPhase(this.options.pid, this.options.started, parsed.body, parsed.phase);
    if (result.ok) await finalizeGreenPhase(this.deps.git, this.deps.logger, parsed.phase);
    await reportPhaseComplete(ctx, parsed.phase, result);
  }
  private buildContext(): ProcessContext {
    return { ...this.deps, pid: this.options.pid, started: this.options.started };
  }
}
