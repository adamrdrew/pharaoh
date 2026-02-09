// Version reading from package.json
import path from 'node:path';
export async function readVersion(fs, cwd) {
    try {
        const packageJsonPath = path.join(cwd, 'package.json');
        const content = await fs.readFile(packageJsonPath);
        const parsed = JSON.parse(content);
        return parsed.version && parsed.version.length > 0 ? parsed.version : 'unknown';
    }
    catch {
        return 'unknown';
    }
}
//# sourceMappingURL=version.js.map