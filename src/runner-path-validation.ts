// Path validation for hook handlers

import { resolve } from 'node:path';

export function isPathAllowed(targetPath: string, allowedPaths: string[]): boolean {
  const normalized = resolve(targetPath);
  return allowedPaths.some(allowed => normalized.startsWith(resolve(allowed)));
}

export function checkPathViolation(input: { tool_name?: string; tool_input?: Record<string, unknown> }, allowedPaths: string[]): string | null {
  const toolName = input.tool_name;
  if (!toolName || !input.tool_input) return null;
  if (['Read', 'Write', 'Edit'].includes(toolName)) return checkFilePath(input.tool_input, allowedPaths);
  if (['Glob', 'Grep'].includes(toolName)) return checkOptionalPath(input.tool_input, allowedPaths);
  return null;
}

function checkFilePath(toolInput: Record<string, unknown>, allowedPaths: string[]): string | null {
  const filePath = toolInput.file_path;
  if (typeof filePath !== 'string') return null;
  return isPathAllowed(filePath, allowedPaths) ? null : filePath;
}

function checkOptionalPath(toolInput: Record<string, unknown>, allowedPaths: string[]): string | null {
  const path = toolInput.path;
  if (path === undefined) return null;
  if (typeof path !== 'string') return null;
  return isPathAllowed(path, allowedPaths) ? null : path;
}
