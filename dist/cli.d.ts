export interface ParsedArgs {
    readonly command: string;
    readonly model?: string;
}
/**
 * Parse CLI arguments
 */
export declare function parseArgs(argv: readonly string[]): ParsedArgs;
//# sourceMappingURL=cli.d.ts.map