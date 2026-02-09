// Dispatch file parser (markdown with YAML frontmatter)
import matter from 'gray-matter';
/**
 * Parse dispatch file (markdown with YAML frontmatter)
 */
export function parseDispatchFile(content) {
    let parsed;
    const trimmed = content.trim();
    if (trimmed.length === 0) {
        return { ok: false, error: 'Dispatch file is empty' };
    }
    try {
        parsed = matter(content);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Failed to parse frontmatter: ${message}` };
    }
    const body = parsed.content.trim();
    if (body.length === 0) {
        return { ok: false, error: 'Dispatch file body is empty' };
    }
    const phase = typeof parsed.data.phase === 'string' ? parsed.data.phase : undefined;
    const model = typeof parsed.data.model === 'string' ? parsed.data.model : undefined;
    const file = {
        phase,
        model: model ?? 'opus',
        body,
    };
    return { ok: true, file };
}
//# sourceMappingURL=parser.js.map