// CLI argument parsing

export interface ParsedArgs {
  readonly command: string;
  readonly model?: string;
}

/**
 * Parse CLI arguments
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const args = argv.slice(2);
  const command = args[0] ?? '';
  const model = extractFlag(args, '--model');
  return { command, model };
}

function extractFlag(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}
