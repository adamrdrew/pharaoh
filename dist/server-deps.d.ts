import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { DispatchWatcher } from './watcher.js';
import type { Filesystem } from './status.js';
import type { Versions } from './version.js';
export interface ServerPaths {
    readonly cwd: string;
    readonly dispatchPath: string;
    readonly statusPath: string;
    readonly logPath: string;
    readonly eventsPath: string;
}
export interface ServerConfig {
    readonly model?: string;
}
export interface ServerMetadata extends Versions {
    readonly model: string;
    readonly cwd: string;
}
export declare function initializeDependencies(fs: Filesystem, paths: ServerPaths, config: ServerConfig): Promise<{
    logger: Logger;
    status: StatusManager;
    watcher: DispatchWatcher;
    metadata: ServerMetadata;
}>;
//# sourceMappingURL=server-deps.d.ts.map