// Watcher process context

import type { Filesystem } from './status.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';
import type { ServerMetadata } from './server-deps.js';

export interface ProcessContext {
  readonly fs: Filesystem;
  readonly logger: Logger;
  readonly status: StatusManager;
  readonly pid: number;
  readonly started: string;
  readonly metadata: ServerMetadata;
  readonly phasesCompleted: number;
}
