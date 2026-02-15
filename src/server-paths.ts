// Server path construction

import path from 'node:path';
import type { ServerPaths } from './server-deps.js';

export function buildPaths(cwd: string): ServerPaths {
  const pharaohDir = path.join(cwd, '.pharaoh');
  return createServerPaths(cwd, pharaohDir);
}

function createServerPaths(cwd: string, pharaohDir: string): ServerPaths {
  return { cwd, dispatchPath: path.join(pharaohDir, 'dispatch'), statusPath: path.join(pharaohDir, 'pharaoh.json'), logPath: path.join(pharaohDir, 'pharaoh.log'), eventsPath: path.join(pharaohDir, 'events.jsonl'), lockPath: path.join(pharaohDir, 'pharaoh.lock') };
}
