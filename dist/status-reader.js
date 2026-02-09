// Status file reader with validation
import { isValidServiceStatus } from './validation.js';
export async function readStatus(fs, statusPath) {
    const exists = await fs.exists(statusPath);
    if (!exists) {
        return { ok: false, error: 'Status file does not exist' };
    }
    const content = await fs.readFile(statusPath);
    return parseStatusContent(content);
}
function parseStatusContent(content) {
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Failed to parse pharaoh.json: ${message}` };
    }
    if (!isValidServiceStatus(parsed)) {
        return { ok: false, error: 'Invalid pharaoh.json structure' };
    }
    return { ok: true, status: parsed };
}
//# sourceMappingURL=status-reader.js.map