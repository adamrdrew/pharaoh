// Dispatch file parser (markdown with YAML frontmatter)

import matter from 'gray-matter';
import type { DispatchFile } from './types.js';

/**
 * Result type for parse operations
 */
export type ParseResult =
  | { readonly ok: true; readonly file: DispatchFile }
  | { readonly ok: false; readonly error: string };

/**
 * Parse dispatch file (markdown with YAML frontmatter)
 */
export function parseDispatchFile(content: string): ParseResult {
  let parsed: ReturnType<typeof matter>;

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Dispatch file is empty' };
  }

  try {
    parsed = matter(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to parse frontmatter: ${message}` };
  }

  const body = parsed.content.trim();
  if (body.length === 0) {
    return { ok: false, error: 'Dispatch file body is empty' };
  }

  const phase = typeof parsed.data.phase === 'string' ? parsed.data.phase : undefined;
  const model = typeof parsed.data.model === 'string' ? parsed.data.model : undefined;

  const file: DispatchFile = {
    phase,
    model: model ?? 'opus',
    body,
  };

  return { ok: true, file };
}
