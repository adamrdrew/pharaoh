// Status manager for atomic service.json operations
/**
 * Type guard to validate unknown value is a valid ServiceStatus
 */
function isValidServiceStatus(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value;
    // Check common required fields
    if (typeof obj.status !== 'string')
        return false;
    if (typeof obj.pid !== 'number')
        return false;
    if (typeof obj.started !== 'string')
        return false;
    // Validate based on status discriminator
    switch (obj.status) {
        case 'idle':
            return true;
        case 'busy':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string');
        case 'done':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string' &&
                typeof obj.phaseCompleted === 'string' &&
                typeof obj.costUsd === 'number' &&
                typeof obj.turns === 'number');
        case 'blocked':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string' &&
                typeof obj.phaseCompleted === 'string' &&
                typeof obj.error === 'string' &&
                typeof obj.costUsd === 'number' &&
                typeof obj.turns === 'number');
        default:
            return false;
    }
}
/**
 * Manages service.json with atomic writes and state transitions
 */
export class StatusManager {
    fs;
    statusPath;
    constructor(fs, statusPath) {
        this.fs = fs;
        this.statusPath = statusPath;
    }
    /**
     * Atomically write status to service.json
     */
    async write(status) {
        const tmpPath = `${this.statusPath}.tmp`;
        const content = JSON.stringify(status, null, 2);
        await this.fs.writeFile(tmpPath, content);
        await this.fs.rename(tmpPath, this.statusPath);
    }
    /**
     * Read current status from service.json
     */
    async read() {
        const exists = await this.fs.exists(this.statusPath);
        if (!exists) {
            return { ok: false, error: 'Status file does not exist' };
        }
        const content = await this.fs.readFile(this.statusPath);
        let parsed;
        try {
            parsed = JSON.parse(content);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { ok: false, error: `Failed to parse service.json: ${message}` };
        }
        if (!isValidServiceStatus(parsed)) {
            return { ok: false, error: 'Invalid service.json structure' };
        }
        return { ok: true, status: parsed };
    }
    /**
     * Remove service.json (used during shutdown)
     */
    async remove() {
        const exists = await this.fs.exists(this.statusPath);
        if (exists) {
            await this.fs.unlink(this.statusPath);
        }
    }
    /**
     * Set status to idle
     */
    async setIdle(pid, started) {
        const status = {
            status: 'idle',
            pid,
            started,
        };
        await this.write(status);
    }
    /**
     * Set status to busy
     */
    async setBusy(pid, started, phase, phaseStarted) {
        const status = {
            status: 'busy',
            pid,
            started,
            phase,
            phaseStarted,
        };
        await this.write(status);
    }
    /**
     * Set status to done
     */
    async setDone(pid, started, phase, phaseStarted, phaseCompleted, costUsd, turns) {
        const status = {
            status: 'done',
            pid,
            started,
            phase,
            phaseStarted,
            phaseCompleted,
            costUsd,
            turns,
        };
        await this.write(status);
    }
    /**
     * Set status to blocked
     */
    async setBlocked(pid, started, phase, phaseStarted, phaseCompleted, error, costUsd, turns) {
        const status = {
            status: 'blocked',
            pid,
            started,
            phase,
            phaseStarted,
            phaseCompleted,
            error,
            costUsd,
            turns,
        };
        await this.write(status);
    }
}
//# sourceMappingURL=status.js.map