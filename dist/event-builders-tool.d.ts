import type { PharaohEvent } from './event-writer.js';
interface ToolProgressMessage {
    readonly type: 'tool_progress';
    readonly tool_use_id: string;
    readonly elapsed_millis: number;
}
interface ToolSummaryMessage {
    readonly type: 'tool_use_summary';
    readonly summary: string;
    readonly tool_use_ids: readonly string[];
}
export declare function buildToolProgressEvent(message: ToolProgressMessage): PharaohEvent;
export declare function buildToolSummaryEvent(message: ToolSummaryMessage): PharaohEvent;
export {};
//# sourceMappingURL=event-builders-tool.d.ts.map