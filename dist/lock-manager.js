// Lock manager abstraction for single-instance enforcement
import { LockError } from './lock-types.js';
import { randomBytes } from 'crypto';
/**
 * Real lock manager using filesystem-based PID locking
 */
export class RealLockManager {
    fs;
    lockPath;
    pidChecker;
    currentLock;
    constructor(fs, lockPath, pidChecker) {
        this.fs = fs;
        this.lockPath = lockPath;
        this.pidChecker = pidChecker;
    }
    async acquire() {
        return acquireLock(this.fs, this.lockPath, this.pidChecker, (lock) => { this.currentLock = lock; });
    }
    async validate() {
        return validateLock(this.fs, this.lockPath, this.currentLock);
    }
    async release() {
        await releaseLock(this.fs, this.lockPath, this.currentLock);
        this.currentLock = undefined;
    }
}
/**
 * Real PID checker using process.kill(pid, 0)
 */
export class RealPidChecker {
    isRunning(pid) {
        return isProcessRunning(pid);
    }
}
function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
async function acquireLock(fs, lockPath, pidChecker, onAcquired) {
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
async function handleAcquireFailure(fs, lockPath, pidChecker, onAcquired) {
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
function buildHeldResult(existing) {
    return {
        ok: false,
        error: new LockError('acquire', 'lock held by another process', existing),
    };
}
async function writeLockFileExclusive(fs, lockPath, lock) {
    await fs.openExclusive(lockPath, JSON.stringify(lock, null, 2));
}
async function overwriteStaleLock(fs, lockPath, onAcquired) {
    const lock = buildLockInfo();
    await writeLockFile(fs, lockPath, lock);
    onAcquired(lock);
    return { ok: true, value: lock };
}
function buildLockInfo() {
    return {
        pid: process.pid,
        started: new Date().toISOString(),
        instanceId: randomBytes(8).toString('hex'),
    };
}
async function writeLockFile(fs, lockPath, lock) {
    await fs.writeFile(lockPath, JSON.stringify(lock, null, 2));
}
async function validateLock(fs, lockPath, current) {
    if (!current)
        return false;
    const exists = await fs.exists(lockPath);
    if (!exists)
        return false;
    const content = await fs.readFile(lockPath);
    const stored = JSON.parse(content);
    return matchesCurrentLock(stored, current);
}
function matchesCurrentLock(stored, current) {
    return stored.instanceId === current.instanceId;
}
async function releaseLock(fs, lockPath, current) {
    if (!current)
        return;
    const valid = await validateLock(fs, lockPath, current);
    if (!valid)
        return;
    await fs.unlink(lockPath);
}
//# sourceMappingURL=lock-manager.js.map