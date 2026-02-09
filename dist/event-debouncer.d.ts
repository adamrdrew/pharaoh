/**
 * Limits tool progress event frequency to prevent excessive I/O
 */
export declare class ProgressDebouncer {
    private readonly lastWriteTime;
    private readonly debounceMs;
    constructor(debounceMs?: number);
    shouldWrite(toolUseId: string): boolean;
    private isDebounced;
    private recordWrite;
    markWritten(toolUseId: string): void;
}
//# sourceMappingURL=event-debouncer.d.ts.map