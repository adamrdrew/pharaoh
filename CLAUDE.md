# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Pharaoh?

A filesystem-based job runner built on the Claude Agent SDK. Pharaoh watches `.pharaoh/dispatch/` for markdown files containing phase prompts, executes them via the Claude Agent SDK's `ir-kat` skill (Ushabti Scribe → Builder → Overseer loop), and reports status through `pharaoh.json`.

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

Flat `src/` directory, one module per file, no subdirectories. Modules are decomposed to respect the 100-line/5-line Sandi Metz limits, so related functionality is split across multiple files with a shared prefix (e.g., `runner-*.ts`, `status-*.ts`, `watcher-*.ts`, `server-*.ts`, `git-*.ts`).

### Core module groups

- **CLI**: `index.ts` (entry point), `cli.ts` (arg parsing), `version.ts`
- **Server lifecycle**: `server.ts` (top-level `serve()`), `server-deps.ts` (DI wiring), `server-paths.ts` (path resolution), `server-startup.ts`, `shutdown.ts` (graceful SIGTERM/SIGINT)
- **Types**: `types.ts` (discriminated unions: `ServiceStatus`, `PhaseResult`, `DispatchFile`), `type-guards.ts`, `validation.ts`
- **Status**: `status.ts` (`StatusManager` class + `Filesystem` interface), `status-reader.ts`, `status-writer.ts` (atomic write-via-rename), `status-setters.ts`, `status-inputs.ts`, `status-check.ts`
- **Runner (SDK execution)**: `runner.ts` (`PhaseRunner` class), `runner-query.ts`, `runner-messages.ts`, `runner-results.ts`, `runner-verification.ts` (post-phase `/phase-status` check), `plugin-resolver.ts`
- **Watcher**: `watcher.ts` (`DispatchWatcher` with sequential queue + busy flag), `watcher-setup.ts`, `watcher-helpers.ts`, `watcher-context.ts`
- **Git integration**: `git.ts` (`GitOperations` class), `git-pre-phase.ts` (branch creation from main), `git-post-phase.ts` (commit + push + PR on green phases), `command-executor.ts`, `which.ts`
- **Infrastructure**: `filesystem.ts` (`RealFilesystem`), `log.ts` (structured logger → `pharaoh.log`), `parser.ts` (YAML frontmatter via `gray-matter`)

### Key abstractions

- **`Filesystem` interface** (defined in `status.ts`) — central DI seam for all file I/O. Tests use `FakeFilesystem`.
- **`CommandExecutor` interface** (defined in `git.ts`) — DI seam for shell commands (git, gh). Tests use fakes.
- **`Logger`** — all production logging; no `console.log` allowed.

### State machine

`pharaoh.json` transitions: `idle → busy → (done|blocked) → idle`

### Dispatch flow

1. Markdown file appears in `.pharaoh/dispatch/`
2. Watcher detects, reads, parses frontmatter + body
3. Dispatch file is deleted
4. `pharaoh.json` set to `busy`
5. Git pre-phase: verify clean main branch, pull, create feature branch `pharaoh/{phase-slug}`
6. `runner.ts` invokes SDK `query()` with `/ir-kat` prompt
7. Post-query: lightweight `/phase-status latest` verification to catch incomplete agent loops
8. Git post-phase (green only): stage all, commit, push, open PR via `gh`
9. `pharaoh.json` set to `done` or `blocked`, then back to `idle`

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
