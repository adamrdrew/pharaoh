// Version reading from package.json

import path from 'node:path';
import { readFileSync } from 'node:fs';
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

export interface Versions {
  readonly pharaohVersion: string;
  readonly ushabtiVersion: string;
}

export function readVersions(): Versions {
  const pharaohVersion = readVersionSync(process.cwd());
  const ushabtiPath = path.join(process.cwd(), 'node_modules', 'ushabti');
  const ushabtiVersion = readVersionSync(ushabtiPath);
  return { pharaohVersion, ushabtiVersion };
}

function readVersionSync(dir: string): string {
  try {
    const pkgPath = path.join(dir, 'package.json');
    const content = readFileSync(pkgPath, 'utf-8');
    const parsed = JSON.parse(content) as { version?: string };
    return parsed.version && parsed.version.length > 0 ? parsed.version : 'unknown';
  } catch {
    return 'unknown';
  }
}
