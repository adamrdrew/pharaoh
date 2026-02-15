// Real filesystem implementation for production
import { promises as fs } from 'fs';
/**
 * Real filesystem implementation using Node's fs promises API
 */
export class RealFilesystem {
    async readFile(path) {
        return fs.readFile(path, 'utf-8');
    }
    async writeFile(path, content) {
        await fs.writeFile(path, content, 'utf-8');
    }
    async appendFile(path, content) {
        await fs.appendFile(path, content, 'utf-8');
    }
    async mkdir(path, options) {
        await fs.mkdir(path, options);
    }
    async rename(oldPath, newPath) {
        await fs.rename(oldPath, newPath);
    }
    async unlink(path) {
        await fs.unlink(path);
    }
    async exists(path) {
        try {
            await fs.access(path);
            return true;
        }
        catch {
            return false;
        }
    }
    async readdir(path) {
        return fs.readdir(path);
    }
    async stat(path) {
        const stats = await fs.stat(path);
        return { isDirectory: () => stats.isDirectory(), mtimeMs: stats.mtimeMs };
    }
    async openExclusive(path, content) {
        const handle = await fs.open(path, 'wx');
        try {
            await handle.writeFile(content, 'utf-8');
        }
        finally {
            await handle.close();
        }
    }
}
//# sourceMappingURL=filesystem.js.map