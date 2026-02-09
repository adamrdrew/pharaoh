import type { PharaohEvent } from './event-writer.js';
interface SystemMessage {
    readonly type: 'system';
    readonly subtype: string;
    readonly status?: string;
    readonly model?: string;
    readonly tools?: readonly unknown[];
    readonly plugins?: readonly unknown[];
}
interface ResultMessage {
    readonly type: 'result';
    readonly subtype: string;
    readonly num_turns: number;
    readonly total_cost_usd: number;
    readonly errors: readonly string[];
}
export declare function buildSystemInitEvent(message: SystemMessage): PharaohEvent;
export declare function buildSystemStatusEvent(message: SystemMessage): PharaohEvent;
export declare function buildResultEvent(message: ResultMessage): PharaohEvent;
export declare function buildErrorEvent(message: ResultMessage): PharaohEvent;
export {};
//# sourceMappingURL=event-builders-system.d.ts.map