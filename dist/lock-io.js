// Lock file I/O primitives
import { randomBytes } from 'crypto';
export async function writeLockFileExclusive(fs, lockPath, lock) {
    await fs.openExclusive(lockPath, JSON.stringify(lock, null, 2));
}
export async function writeLockFile(fs, lockPath, lock) {
    await fs.writeFile(lockPath, JSON.stringify(lock, null, 2));
}
export function buildLockInfo() {
    return {
        pid: process.pid,
        started: new Date().toISOString(),
        instanceId: randomBytes(8).toString('hex'),
    };
}
//# sourceMappingURL=lock-io.js.map