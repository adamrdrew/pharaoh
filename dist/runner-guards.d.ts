export declare function hasType(msg: unknown): msg is {
    type: string;
};
export declare function isResultMessage(msg: unknown): msg is ResultMessage;
export declare function isAssistantMessage(msg: unknown): msg is AssistantMessage;
export declare function isToolProgressMessage(msg: unknown): msg is ToolProgressMessage;
export declare function isToolSummaryMessage(msg: unknown): msg is ToolSummaryMessage;
export declare function isSystemMessage(msg: unknown): msg is SystemMessage;
export interface ResultMessage {
    readonly type: 'result';
    readonly subtype: string;
    readonly num_turns?: number;
    readonly total_cost_usd?: number;
    readonly errors?: readonly string[];
}
export interface AssistantMessage {
    readonly type: 'assistant';
    readonly message: {
        readonly content: readonly unknown[];
        readonly usage?: {
            readonly input_tokens: number;
            readonly output_tokens: number;
        };
    };
}
export interface ToolProgressMessage {
    readonly type: 'tool_progress';
    readonly tool_use_id: string;
    readonly tool_name?: string;
    readonly elapsed_time_seconds: number;
}
export interface ToolSummaryMessage {
    readonly type: 'tool_use_summary';
    readonly summary: string;
    readonly preceding_tool_use_ids: readonly string[];
}
export interface SystemMessage {
    readonly type: 'system';
    readonly subtype: string;
    readonly status?: string;
    readonly model?: string;
    readonly tools?: readonly unknown[];
    readonly plugins?: readonly unknown[];
}
//# sourceMappingURL=runner-guards.d.ts.map