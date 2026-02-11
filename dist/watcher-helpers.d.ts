import type { ProcessContext } from './watcher-context.js';
export declare function checkFileExists(ctx: ProcessContext, path: string): Promise<boolean>;
export declare function parseAndValidate(ctx: ProcessContext, path: string): Promise<{
    ok: true;
    phase: string;
    body: string;
} | {
    ok: false;
}>;
export declare function reportPhaseComplete(ctx: ProcessContext, phaseName: string, result: {
    ok: boolean;
    costUsd: number;
    turns: number;
    error?: string;
}, updatedCounter: number): Promise<void>;
//# sourceMappingURL=watcher-helpers.d.ts.map