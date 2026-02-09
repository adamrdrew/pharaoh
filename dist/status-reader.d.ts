import type { ServiceStatus } from './types.js';
import type { Filesystem } from './status.js';
export type ReadResult = {
    readonly ok: true;
    readonly status: ServiceStatus;
} | {
    readonly ok: false;
    readonly error: string;
};
export declare function readStatus(fs: Filesystem, statusPath: string): Promise<ReadResult>;
//# sourceMappingURL=status-reader.d.ts.map