import type { EventWriter } from './event-writer.js';
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
    readonly message: {
        readonly content: readonly ContentBlock[];
        readonly usage?: {
            readonly input_tokens: number;
            readonly output_tokens: number;
        };
    };
}
export declare function captureAssistantEvents(msg: AssistantMessage, turnNumber: number, eventWriter: EventWriter): Promise<void>;
export {};
//# sourceMappingURL=runner-events-assistant.d.ts.map