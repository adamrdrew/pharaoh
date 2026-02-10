// Phase status verification via direct filesystem read
import { join } from 'path';
import { findLatestPhaseDir } from './status-check-finder.js';
import { parsePhaseStatus } from './status-check-parser.js';
export async function checkPhaseStatus(cwd, fs, logger) {
    try {
        const dirResult = await findLatestPhaseDir(cwd, fs);
        if (!dirResult.ok)
            return dirResult;
        const progressPath = join(dirResult.status, 'progress.yaml');
        const yamlContent = await fs.readFile(progressPath);
        return parsePhaseStatus(yamlContent);
    }
    catch (err) {
        return buildErrorResult(logger, err);
    }
}
async function buildErrorResult(logger, err) {
    await logger.warn('Phase status check failed', { error: String(err) });
    return { ok: false, error: String(err) };
}
//# sourceMappingURL=status-check.js.map