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
}
//# sourceMappingURL=filesystem.js.map