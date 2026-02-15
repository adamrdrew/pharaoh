// Tests for SDK query configuration and hook enforcement

import { describe, test, expect } from 'vitest';
import { createHookOptions } from '../src/runner-query.js';
import type { RunnerConfig } from '../src/runner.js';
import type { Logger } from '../src/log.js';

const mockConfig: RunnerConfig = { cwd: '/Users/adam/Development/pharoh', model: 'claude-opus-4-6' };
const mockLogger: Logger = { debug: async () => {}, info: async () => {}, warn: async () => {}, error: async () => {} };
const mockPhaseName = 'test-phase';

function getHook(config: RunnerConfig): (input: unknown) => Promise<unknown> {
  const hookOptions = createHookOptions(config, mockLogger, mockPhaseName);
  const hooks = (hookOptions.hooks as { PreToolUse: Array<{ hooks: Array<(input: unknown) => Promise<unknown>> }> }).PreToolUse[0].hooks;
  return hooks[0];
}

describe('sandbox enforcement', () => {
  test('blocks Bash with dangerouslyDisableSandbox', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Bash', tool_input: { command: 'swift build', dangerouslyDisableSandbox: true } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('dangerouslyDisableSandbox');
  });

  test('allows Bash without dangerouslyDisableSandbox', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Bash', tool_input: { command: 'swift build' } };
    const result = await hook(input) as { continue?: boolean };
    expect(result.continue).toBe(true);
    expect(result).not.toHaveProperty('decision');
  });
});

describe('path validation', () => {
  test('blocks Read outside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Read', tool_input: { file_path: '/Users/adam/Photos/test.jpg' } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('/Users/adam/Photos/test.jpg');
  });

  test('allows Read inside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Read', tool_input: { file_path: '/Users/adam/Development/pharoh/src/index.ts' } };
    const result = await hook(input) as { continue?: boolean };
    expect(result.continue).toBe(true);
    expect(result).not.toHaveProperty('decision');
  });

  test('blocks path traversal', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Read', tool_input: { file_path: '/Users/adam/Development/pharoh/../../Photos/test.jpg' } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('Photos/test.jpg');
  });

  test('allows Glob without path field', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Glob', tool_input: { pattern: '**/*.ts' } };
    const result = await hook(input) as { continue?: boolean };
    expect(result.continue).toBe(true);
    expect(result).not.toHaveProperty('decision');
  });

  test('blocks Glob with external path', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Glob', tool_input: { pattern: '*.jpg', path: '/Users/adam/Photos' } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('/Users/adam/Photos');
  });

  test('blocks Write outside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Write', tool_input: { file_path: '/etc/passwd', content: 'bad' } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('/etc/passwd');
  });

  test('allows Write inside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Write', tool_input: { file_path: '/Users/adam/Development/pharoh/output.txt', content: 'good' } };
    const result = await hook(input) as { continue?: boolean };
    expect(result.continue).toBe(true);
    expect(result).not.toHaveProperty('decision');
  });

  test('blocks Edit outside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Edit', tool_input: { file_path: '/usr/bin/something', old_string: 'a', new_string: 'b' } };
    const result = await hook(input) as { decision?: string; reason?: string };
    expect(result.decision).toBe('block');
    expect(result.reason).toContain('/usr/bin/something');
  });

  test('allows Edit inside cwd', async () => {
    const hook = getHook(mockConfig);
    const input = { tool_name: 'Edit', tool_input: { file_path: '/Users/adam/Development/pharoh/src/runner.ts', old_string: 'a', new_string: 'b' } };
    const result = await hook(input) as { continue?: boolean };
    expect(result.continue).toBe(true);
    expect(result).not.toHaveProperty('decision');
  });
});

describe('existing hook behavior', () => {
  test('blocks AskUserQuestion', async () => {
    const hook = getHook(mockConfig);
    const input = { hook_event_name: 'PreToolUse', tool_name: 'AskUserQuestion', tool_input: { question: 'Proceed?' } };
    const result = await hook(input) as { decision?: string; systemMessage?: string };
    expect(result.decision).toBe('block');
    expect(result.systemMessage).toBe('Proceed with your best judgement');
  });
});
