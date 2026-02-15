// Lock acquisition logic
import { LockError } from './lock-types.js';
import { buildLockInfo, writeLockFileExclusive, writeLockFile, } from './lock-io.js';
export async function acquireLock(fs, lockPath, pidChecker, onAcquired) {
    const lock = buildLockInfo();
    try {
        await writeLockFileExclusive(fs, lockPath, lock);
        onAcquired(lock);
        return { ok: true, value: lock };
    }
    catch (err) {
        return handleAcquireFailure(fs, lockPath, pidChecker, onAcquired);
    }
}
export async function handleAcquireFailure(fs, lockPath, pidChecker, onAcquired) {
    const exists = await fs.exists(lockPath);
    if (!exists)
        throw new Error('Lock acquire failed but file does not exist');
    const content = await fs.readFile(lockPath);
    const existing = JSON.parse(content);
    const running = pidChecker.isRunning(existing.pid);
    if (running)
        return buildHeldResult(existing);
    return overwriteStaleLock(fs, lockPath, onAcquired);
}
export function buildHeldResult(existing) {
    return {
        ok: false,
        error: new LockError('acquire', 'lock held by another process', existing),
    };
}
export async function overwriteStaleLock(fs, lockPath, onAcquired) {
    const lock = buildLockInfo();
    await writeLockFile(fs, lockPath, lock);
    onAcquired(lock);
    return { ok: true, value: lock };
}
//# sourceMappingURL=lock-acquire.js.map