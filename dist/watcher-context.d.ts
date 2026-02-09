import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
export interface ProcessContext {
    readonly fs: Filesystem;
    readonly logger: Logger;
    readonly status: StatusManager;
    readonly pid: number;
    readonly started: string;
}
//# sourceMappingURL=watcher-context.d.ts.map