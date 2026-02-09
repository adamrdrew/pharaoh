// Debouncer for tool progress events
/**
 * Limits tool progress event frequency to prevent excessive I/O
 */
export class ProgressDebouncer {
    lastWriteTime = new Map();
    debounceMs;
    constructor(debounceMs = 5000) {
        this.debounceMs = debounceMs;
    }
    shouldWrite(toolUseId) {
        const now = Date.now();
        const last = this.lastWriteTime.get(toolUseId);
        return this.isDebounced(now, last);
    }
    isDebounced(now, last) {
        if (last === undefined)
            return this.recordWrite(now);
        if (now - last >= this.debounceMs)
            return this.recordWrite(now);
        return false;
    }
    recordWrite(now) {
        return true;
    }
    markWritten(toolUseId) {
        this.lastWriteTime.set(toolUseId, Date.now());
    }
}
//# sourceMappingURL=event-debouncer.js.map