import { Logger } from './log.js';
import { StatusManager } from './status.js';
import { DispatchWatcher } from './watcher.js';
import type { Filesystem } from './status.js';
export interface ServerPaths {
    readonly cwd: string;
    readonly dispatchPath: string;
    readonly statusPath: string;
    readonly logPath: string;
}
export interface ServerConfig {
    readonly pluginPath: string;
    readonly model?: string;
}
export declare function initializeDependencies(fs: Filesystem, paths: ServerPaths, config: ServerConfig): Promise<{
    logger: Logger;
    status: StatusManager;
    watcher: DispatchWatcher;
}>;
//# sourceMappingURL=server-deps.d.ts.map