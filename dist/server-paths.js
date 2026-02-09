// Server path construction
import path from 'node:path';
export function buildPaths(cwd) {
    const pharaohDir = path.join(cwd, '.pharaoh');
    return createServerPaths(cwd, pharaohDir);
}
function createServerPaths(cwd, pharaohDir) {
    return { cwd, dispatchPath: path.join(pharaohDir, 'dispatch'), statusPath: path.join(pharaohDir, 'pharaoh.json'), logPath: path.join(pharaohDir, 'pharaoh.log'), eventsPath: path.join(pharaohDir, 'events.jsonl') };
}
//# sourceMappingURL=server-paths.js.map