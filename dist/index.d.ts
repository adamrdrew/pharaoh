#!/usr/bin/env node
import type { Filesystem } from './status.js';
/**
 * Read version from package.json
 * Returns the version string if found, or "unknown" if the file cannot be read,
 * is malformed, or does not contain a version field.
 */
export declare function readVersion(fs: Filesystem, cwd: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map