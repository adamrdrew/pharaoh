// Status manager for atomic pharaoh.json operations
import { readStatus } from './status-reader.js';
import { writeStatus } from './status-writer.js';
import { buildIdleStatus, buildBusyStatus, buildDoneStatus, buildBlockedStatus, } from './status-setters.js';
/**
 * Manages pharaoh.json with atomic writes and state transitions
 */
export class StatusManager {
    fs;
    statusPath;
    constructor(fs, statusPath) {
        this.fs = fs;
        this.statusPath = statusPath;
    }
    async write(status) {
        await writeStatus(this.fs, this.statusPath, status);
    }
    async read() {
        return readStatus(this.fs, this.statusPath);
    }
    async remove() {
        const exists = await this.fs.exists(this.statusPath);
        if (exists)
            await this.fs.unlink(this.statusPath);
    }
    async setIdle(input) {
        await this.write(buildIdleStatus(input));
    }
    async setBusy(input) {
        await this.write(buildBusyStatus(input));
    }
    async setDone(input) {
        await this.write(buildDoneStatus(input));
    }
    async setBlocked(input) {
        await this.write(buildBlockedStatus(input));
    }
}
//# sourceMappingURL=status.js.map