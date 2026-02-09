import type { EventWriter } from './event-writer.js';
import type { ProgressDebouncer } from './event-debouncer.js';
interface ToolUseBlock {
    readonly type: 'tool_use';
    readonly id: string;
    readonly name: string;
    readonly input: Record<string, unknown>;
}
interface TextBlock {
    readonly type: 'text';
    readonly text: string;
}
type ContentBlock = ToolUseBlock | TextBlock;
interface AssistantMessage {
    readonly type: 'assistant';
    readonly content: readonly ContentBlock[];
    readonly usage?: {
        readonly input_tokens: number;
        readonly output_tokens: number;
    };
}
export declare function captureAssistantEvents(message: AssistantMessage, turnNumber: number, eventWriter: EventWriter): Promise<void>;
interface ToolProgressMessage {
    readonly type: 'tool_progress';
    readonly tool_use_id: string;
    readonly elapsed_millis: number;
}
export declare function captureToolProgressEvent(message: ToolProgressMessage, debouncer: ProgressDebouncer, eventWriter: EventWriter): Promise<void>;
interface ToolSummaryMessage {
    readonly type: 'tool_use_summary';
    readonly summary: string;
    readonly tool_use_ids: readonly string[];
}
export declare function captureToolSummaryEvent(message: ToolSummaryMessage, eventWriter: EventWriter): Promise<void>;
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
//# sourceMappingURL=runner-events.d.ts.map