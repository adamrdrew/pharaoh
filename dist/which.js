// Command existence check
import { execSync } from 'node:child_process';
export function which(command) {
    try {
        const result = execSync(`which ${command}`, { encoding: 'utf-8' });
        return result.trim() || null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=which.js.map