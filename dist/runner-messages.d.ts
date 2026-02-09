import type { Logger } from './log.js';
import type { PhaseResult } from './types.js';
export declare function handleResultMessage(message: {
    type: 'result';
    subtype: string;
    num_turns: number;
    total_cost_usd: number;
    errors: string[];
}, logger: Logger, phaseName: string, startTime: number): Promise<PhaseResult>;
export declare function handleAssistantMessage(logger: Logger, phaseName: string, messageCounter: number): Promise<void>;
export declare function handleSystemMessage(logger: Logger, phaseName: string, status: string): Promise<void>;
//# sourceMappingURL=runner-messages.d.ts.map