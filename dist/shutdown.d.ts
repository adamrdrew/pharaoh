import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { DispatchWatcher } from './watcher.js';
import type { LockManager } from './lock-manager.js';
export interface ShutdownDependencies {
    readonly logger: Logger;
    readonly status: StatusManager;
    readonly watcher: DispatchWatcher;
    readonly lock: LockManager;
}
export declare function registerShutdownHandlers(deps: ShutdownDependencies): void;
//# sourceMappingURL=shutdown.d.ts.map