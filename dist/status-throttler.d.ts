/**
 * Limits status update frequency to prevent excessive I/O
 */
export declare class StatusThrottler {
    private lastWriteTime;
    private readonly throttleMs;
    constructor(throttleMs?: number);
    shouldWrite(): boolean;
    private checkThrottle;
}
//# sourceMappingURL=status-throttler.d.ts.map