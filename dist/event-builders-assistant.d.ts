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
interface AssistantMessageInner {
    readonly content: readonly ContentBlock[];
    readonly usage?: {
        readonly input_tokens: number;
        readonly output_tokens: number;
    };
}
interface AssistantMessage {
    readonly type: 'assistant';
    readonly message: AssistantMessageInner;
}
export declare function buildAssistantToolCallEvent(msg: AssistantMessage, toolUse: ToolUseBlock): PharaohEvent;
export declare function buildAssistantTextEvent(msg: AssistantMessage, textBlock: TextBlock): PharaohEvent;
export declare function buildAssistantTurnEvent(msg: AssistantMessage, turnNumber: number): PharaohEvent;
export {};
//# sourceMappingURL=event-builders-assistant.d.ts.map