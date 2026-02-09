import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { DispatchWatcher } from './watcher.js';
export interface ShutdownDependencies {
    readonly logger: Logger;
    readonly status: StatusManager;
    readonly watcher: DispatchWatcher;
}
export declare function registerShutdownHandlers(deps: ShutdownDependencies): void;
//# sourceMappingURL=shutdown.d.ts.map