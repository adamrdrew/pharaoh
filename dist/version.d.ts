import type { Filesystem } from './status.js';
export declare function readVersion(fs: Filesystem, cwd: string): Promise<string>;
export interface Versions {
    readonly pharaohVersion: string;
    readonly ushabtiVersion: string;
}
export declare function readVersions(): Versions;
//# sourceMappingURL=version.d.ts.map