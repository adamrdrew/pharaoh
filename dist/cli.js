// CLI argument parsing
/**
 * Parse CLI arguments
 */
export function parseArgs(argv) {
    const args = argv.slice(2);
    const command = args[0] ?? '';
    const model = extractFlag(args, '--model');
    return { command, model };
}
function extractFlag(args, flag) {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}
//# sourceMappingURL=cli.js.map