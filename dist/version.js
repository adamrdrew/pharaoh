// Version reading from package.json
import path from 'node:path';
import { readFileSync } from 'node:fs';
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
export function readVersions() {
    const pharaohVersion = readVersionSync(process.cwd());
    const ushabtiPath = path.join(process.cwd(), 'node_modules', 'ushabti');
    const ushabtiVersion = readVersionSync(ushabtiPath);
    return { pharaohVersion, ushabtiVersion };
}
function readVersionSync(dir) {
    try {
        const pkgPath = path.join(dir, 'package.json');
        const content = readFileSync(pkgPath, 'utf-8');
        const parsed = JSON.parse(content);
        return parsed.version && parsed.version.length > 0 ? parsed.version : 'unknown';
    }
    catch {
        return 'unknown';
    }
}
//# sourceMappingURL=version.js.map