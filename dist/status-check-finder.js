// Find latest phase directory by modification time
import { join } from 'path';
export async function findLatestPhaseDir(basePath, fs) {
    const phasesPath = join(basePath, '.ushabti', 'phases');
    const pathExists = await fs.exists(phasesPath);
    if (!pathExists)
        return { ok: false, error: 'phases directory does not exist' };
    const entries = await fs.readdir(phasesPath);
    const dirs = await filterDirectories(phasesPath, entries, fs);
    if (dirs.length === 0)
        return { ok: false, error: 'no phase directories found' };
    const sorted = await sortByModificationTime(phasesPath, dirs, fs);
    return { ok: true, status: join(phasesPath, sorted[0]) };
}
async function filterDirectories(basePath, entries, fs) {
    const checks = entries.map(async (e) => {
        const stat = await fs.stat(join(basePath, e));
        return { name: e, isDir: stat.isDirectory() };
    });
    const results = await Promise.all(checks);
    return results.filter((r) => r.isDir).map((r) => r.name);
}
async function sortByModificationTime(basePath, dirs, fs) {
    const stats = await Promise.all(dirs.map(async (d) => {
        const stat = await fs.stat(join(basePath, d));
        return { name: d, mtime: stat.mtimeMs };
    }));
    stats.sort((a, b) => b.mtime - a.mtime);
    return stats.map((s) => s.name);
}
//# sourceMappingURL=status-check-finder.js.map