// Runtime resolution of plugin path via npm dependency

import { createRequire } from 'node:module';
import { dirname } from 'node:path';

export function resolvePluginPath(): string {
  return resolveUshabtiPath();
}

function resolveUshabtiPath(): string {
  try {
    const req = createRequire(import.meta.url);
    const pkgPath = req.resolve('ushabti/package.json');
    return dirname(pkgPath);
  } catch (err) {
    throw new Error('ushabti not found — run npm install');
  }
}
