import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { DispatchWatcher } from './watcher.js';
import { GitOperations } from './git.js';
import type { Filesystem } from './status.js';
import type { Versions } from './version.js';
import type { LockManager } from './lock-manager.js';
export interface ServerPaths {
    readonly cwd: string;
    readonly dispatchPath: string;
    readonly statusPath: string;
    readonly logPath: string;
    readonly eventsPath: string;
    readonly lockPath: string;
}
export interface ServerConfig {
    readonly model?: string;
}
export interface ServerMetadata extends Versions {
    readonly model: string;
    readonly cwd: string;
}
export declare function initializeDependencies(fs: Filesystem, paths: ServerPaths, config: ServerConfig, lock: LockManager): Promise<{
    logger: Logger;
    status: StatusManager;
    watcher: DispatchWatcher;
    metadata: ServerMetadata;
    git: GitOperations;
    lock: LockManager;
}>;
//# sourceMappingURL=server-deps.d.ts.map