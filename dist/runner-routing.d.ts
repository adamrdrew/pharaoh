import type { Logger } from './log.js';
import type { PhaseResult } from './types.js';
import type { EventWriter } from './event-writer.js';
import type { ProgressDebouncer } from './event-debouncer.js';
export declare function handleMessage(message: unknown, phaseName: string, startTime: number, messageCounter: number, logger: Logger, eventWriter: EventWriter, progressDebouncer: ProgressDebouncer): Promise<PhaseResult | null>;
//# sourceMappingURL=runner-routing.d.ts.map