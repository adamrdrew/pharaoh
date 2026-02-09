// Throttler for status updates
/**
 * Limits status update frequency to prevent excessive I/O
 */
export class StatusThrottler {
    lastWriteTime = 0;
    throttleMs;
    constructor(throttleMs = 5000) {
        this.throttleMs = throttleMs;
    }
    shouldWrite() {
        const now = Date.now();
        return this.checkThrottle(now);
    }
    checkThrottle(now) {
        if (now - this.lastWriteTime >= this.throttleMs) {
            this.lastWriteTime = now;
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=status-throttler.js.map