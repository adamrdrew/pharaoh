#!/usr/bin/env node
// CLI entry point for Pharaoh server
import process from 'node:process';
import { parseArgs } from './cli.js';
import { serve } from './server.js';
async function main() {
    const args = parseArgs(process.argv);
    if (args.command !== 'serve') {
        console.error('Usage: pharaoh serve [--model <model>]');
        process.exit(1);
    }
    await serve({ model: args.model });
}
void main();
//# sourceMappingURL=index.js.map