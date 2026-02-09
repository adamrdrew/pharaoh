import type { DispatchFile } from './types.js';
/**
 * Result type for parse operations
 */
export type ParseResult = {
    readonly ok: true;
    readonly file: DispatchFile;
} | {
    readonly ok: false;
    readonly error: string;
};
/**
 * Parse dispatch file (markdown with YAML frontmatter)
 */
export declare function parseDispatchFile(content: string): ParseResult;
//# sourceMappingURL=parser.d.ts.map