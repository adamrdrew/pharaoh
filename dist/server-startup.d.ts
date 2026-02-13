import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { DispatchWatcher } from './watcher.js';
import type { GitOperations } from './git.js';
import type { ServerPaths, ServerMetadata } from './server-deps.js';
export declare function startServer(deps: {
    logger: Logger;
    status: StatusManager;
    watcher: DispatchWatcher;
    metadata: ServerMetadata;
    git: GitOperations;
}, paths: ServerPaths): Promise<void>;
//# sourceMappingURL=server-startup.d.ts.map