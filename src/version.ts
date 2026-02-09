// Version reading from package.json

import path from 'node:path';
import type { Filesystem } from './status.js';

export async function readVersion(fs: Filesystem, cwd: string): Promise<string> {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const content = await fs.readFile(packageJsonPath);
    const parsed = JSON.parse(content) as { version?: string };
    return parsed.version && parsed.version.length > 0 ? parsed.version : 'unknown';
  } catch {
    return 'unknown';
  }
}
