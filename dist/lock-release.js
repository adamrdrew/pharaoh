// Lock release logic
import { validateLock } from './lock-validate.js';
export async function releaseLock(fs, lockPath, current) {
    if (!current)
        return;
    const valid = await validateLock(fs, lockPath, current);
    if (!valid)
        return;
    await fs.unlink(lockPath);
}
//# sourceMappingURL=lock-release.js.map