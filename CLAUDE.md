# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Pharaoh?

A filesystem-based job runner built on the Claude Agent SDK. Pharaoh watches `.ushabti/dispatch/` for markdown files containing phase prompts, executes them via the Claude Agent SDK's `ir-kat` skill (Ushabti Scribe → Builder → Overseer loop), and reports status through `.ushabti/service.json`.

## Commands

```bash
npm run build        # TypeScript compilation (tsc)
npm run typecheck    # Type-check without emitting (tsc --noEmit)
npm run serve        # Start the server (tsx src/index.ts serve)
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
npx vitest run tests/index.test.ts  # Run a single test file
```

## Architecture

Flat `src/` directory, one module per file, no subdirectories:

- **`index.ts`** — CLI entry point, `serve` command, graceful shutdown (SIGTERM/SIGINT)
- **`types.ts`** — Discriminated unions: `ServiceStatus` (idle/busy/done/blocked), `PhaseResult` (success/failure/blocked), `DispatchFile`
- **`watcher.ts`** — Watches dispatch directory via chokidar; sequential queue with busy flag (one job at a time)
- **`runner.ts`** — Executes phases via `@anthropic-ai/claude-agent-sdk` `query()`, blocks `AskUserQuestion` via PreToolUse hook
- **`parser.ts`** — Parses dispatch files (YAML frontmatter via `gray-matter` + markdown body)
- **`status.ts`** — Atomic write-via-rename to `service.json`; defines the `Filesystem` interface used for DI
- **`log.ts`** — Structured logger writing timestamped entries to `service.log`
- **`filesystem.ts`** — `RealFilesystem` production implementation of the `Filesystem` interface

The `Filesystem` interface (defined in `status.ts`) is the central DI seam — all file I/O goes through it. Tests use `FakeFilesystem` implementations.

### State machine

`service.json` transitions: `idle → busy → (done|blocked) → idle`

### Dispatch flow

1. Markdown file appears in `.ushabti/dispatch/`
2. Watcher detects, reads, parses frontmatter + body
3. Dispatch file is deleted
4. `service.json` set to `busy`
5. `runner.ts` invokes SDK `query()` with `/ir-kat` prompt
6. On completion: `done` or `blocked`, then back to `idle`

## Laws and Style

See `.ushabti/laws.md` and `.ushabti/style.md` for full details. Key constraints:

- **No `any` type** (L02) — not even implicit
- **No type assertions** except at validated system boundaries with runtime checks (L03)
- **Explicit return types** on all public functions (L04)
- **Dependency injection required** — no class instantiates its own dependencies (L06)
- **All side effects behind injectable interfaces** (L07)
- **Unit tests must not touch real systems** — all I/O mocked via `Filesystem` interface (L08)
- **Sandi Metz rules**: classes/modules max 100 lines, functions max 5 lines, max 4 parameters (use options object)
- **Discriminated unions** for state modeling with exhaustive `never` switches
- **Typed Result values** (`{ ok: true; value: T } | { ok: false; error: E }`) for expected failures — no raw string throws
- **Kebab-case filenames**, `const` by default, `readonly` on all properties that don't mutate
- **No `console.log`** in production code — use the structured logger from `log.ts`
- **Functional iteration** preferred (`map`/`filter`/`reduce`) over imperative loops

## Testing

Tests live in `tests/` and mirror `src/` structure. Uses vitest with globals enabled. All tests use `FakeFilesystem` implementing the `Filesystem` interface. Follow Arrange-Act-Assert pattern with descriptive test names that read like specifications.

End-to-end testing uses test projects in the `fixtures/` directory. **Never run end-to-end tests against the Pharaoh project directory itself.** Each fixture is a self-contained project with its own `.ushabti/` configuration.

## Ushabti Framework

This project uses the Ushabti development framework (`.ushabti/` directory). Development proceeds through numbered phases in `.ushabti/phases/`. Documentation lives in `.ushabti/docs/index.md` and must be kept current with code changes (L15, L17).
