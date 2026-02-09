import type { PharaohEvent } from './event-writer.js';
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
export declare function buildAssistantToolCallEvent(message: AssistantMessage, toolUse: ToolUseBlock): PharaohEvent;
export declare function buildAssistantTextEvent(message: AssistantMessage, textBlock: TextBlock): PharaohEvent;
export declare function buildAssistantTurnEvent(message: AssistantMessage, turnNumber: number): PharaohEvent;
export declare function buildToolProgressEvent(message: ToolProgressMessage): PharaohEvent;
export declare function buildToolSummaryEvent(message: ToolSummaryMessage): PharaohEvent;
export declare function buildSystemInitEvent(message: SystemMessage): PharaohEvent;
export declare function buildSystemStatusEvent(message: SystemMessage): PharaohEvent;
export declare function buildResultEvent(message: ResultMessage): PharaohEvent;
export declare function buildErrorEvent(message: ResultMessage): PharaohEvent;
export {};
//# sourceMappingURL=event-builders.d.ts.map