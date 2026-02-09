import type { EventWriter } from './event-writer.js';
interface SystemMessage {
    readonly type: 'system';
    readonly subtype: string;
    readonly status?: string;
    readonly model?: string;
    readonly tools?: readonly unknown[];
    readonly plugins?: readonly unknown[];
}
export declare function captureSystemEvent(message: SystemMessage, eventWriter: EventWriter): Promise<void>;
interface ResultMessage {
    readonly type: 'result';
    readonly subtype: string;
    readonly num_turns: number;
    readonly total_cost_usd: number;
    readonly errors: readonly string[];
}
export declare function captureResultEvent(message: ResultMessage, eventWriter: EventWriter): Promise<void>;
export {};
//# sourceMappingURL=runner-events-system.d.ts.map