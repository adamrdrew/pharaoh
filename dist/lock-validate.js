// Lock validation logic
export async function validateLock(fs, lockPath, current) {
    if (!current)
        return false;
    const exists = await fs.exists(lockPath);
    if (!exists)
        return false;
    const content = await fs.readFile(lockPath);
    const stored = JSON.parse(content);
    return matchesCurrentLock(stored, current);
}
export function matchesCurrentLock(stored, current) {
    return stored.instanceId === current.instanceId;
}
//# sourceMappingURL=lock-validate.js.map