import { type FSWatcher } from 'chokidar';
import type { Logger } from './log.js';
export declare function createWatcher(dispatchPath: string, logger: Logger, onAdd: (path: string) => void): Promise<FSWatcher>;
//# sourceMappingURL=watcher-setup.d.ts.map