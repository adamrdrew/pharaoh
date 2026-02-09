import type { EventWriter } from './event-writer.js';
import type { ProgressDebouncer } from './event-debouncer.js';
interface ToolProgressMessage {
    readonly type: 'tool_progress';
    readonly tool_use_id: string;
    readonly tool_name?: string;
    readonly elapsed_time_seconds: number;
}
export declare function captureToolProgressEvent(message: ToolProgressMessage, debouncer: ProgressDebouncer, eventWriter: EventWriter): Promise<void>;
interface ToolSummaryMessage {
    readonly type: 'tool_use_summary';
    readonly summary: string;
    readonly preceding_tool_use_ids: readonly string[];
}
export declare function captureToolSummaryEvent(message: ToolSummaryMessage, eventWriter: EventWriter): Promise<void>;
export {};
//# sourceMappingURL=runner-events-tool.d.ts.map