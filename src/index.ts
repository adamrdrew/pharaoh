#!/usr/bin/env node

// CLI entry point for Pharaoh server

import process from 'node:process';
import { parseArgs } from './cli.js';
import { serve } from './server.js';

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (args.command !== 'serve' || !args.pluginPath) {
    console.error('Usage: pharaoh serve --plugin-path <path> [--model <model>]');
    process.exit(1);
  }
  await serve({ pluginPath: args.pluginPath, model: args.model });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
