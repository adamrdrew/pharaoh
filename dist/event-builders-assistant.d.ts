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
export declare function buildAssistantToolCallEvent(message: AssistantMessage, toolUse: ToolUseBlock): PharaohEvent;
export declare function buildAssistantTextEvent(message: AssistantMessage, textBlock: TextBlock): PharaohEvent;
export declare function buildAssistantTurnEvent(message: AssistantMessage, turnNumber: number): PharaohEvent;
export {};
//# sourceMappingURL=event-builders-assistant.d.ts.map