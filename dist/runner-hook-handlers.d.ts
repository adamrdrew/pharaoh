import type { Logger } from './log.js';
export declare function handlePathViolation(path: string, allowedPaths: string[], logger: Logger, phaseName: string): Promise<unknown>;
export declare function createBlockHook(allowedPaths: string[], logger: Logger, phaseName: string): (input: unknown) => Promise<unknown>;
//# sourceMappingURL=runner-hook-handlers.d.ts.map