# Phase 0001: Pharaoh Foundation

## Intent

Build a working Pharaoh server from scratch. Pharaoh is a filesystem-based job runner that automates the Ushabti Scribe → Builder → Overseer phase loop using the Claude Agent SDK (TypeScript, V1). This phase delivers the core: a process that starts up, watches for dispatch files, executes phases via the SDK, and reports status through a JSON file on disk.

This is the foundation. The server must prove the core loop works end-to-end: receive dispatch file → execute phase via `ir-kat` skill → report outcome → return to idle. Git integration, detailed progress tracking, and human feedback are explicitly deferred to future phases.

## Scope

**In Scope:**
- TypeScript project structure (`package.json`, `tsconfig.json`, flat `src/` directory)
- CLI entry point (`pharaoh serve`) with graceful shutdown handling
- SDK query runner that invokes the `ir-kat` skill with proper configuration
- Dispatch directory watcher (`.ushabti/dispatch/`) with sequential queueing
- Status management (`service.json`) with atomic writes and state machine transitions
- Structured logging (`service.log`) with human-readable event timeline
- Handling of malformed dispatch files (log, delete, stay idle)
- Loading of Ushabti plugin from local path

**Out of Scope (Future Phases):**
- Git integration (branching, committing, PR creation)
- Detailed progress hooks (extracting current agent/step from message stream)
- Human feedback loop (exposing `AskUserQuestion` via filesystem)
- Unit tests (we will prove this works by running it, not by testing it initially)
- Multiple concurrent jobs (only one at a time in this phase)
- Dispatch file prioritization or advanced queueing

## Constraints

**Architectural Constraints (from architecture doc):**
- **Filesystem IPC only** — No HTTP server, no Express, no routes
- **Skill-driven orchestration** — Pharaoh does NOT implement the Scribe → Builder → Overseer loop. It invokes the `ir-kat` skill which handles the loop
- **One server per project** — Each instance is scoped to exactly one project directory
- **SDK V1** — Use stable `query()` API from `@anthropic-ai/claude-agent-sdk`, not V2 (unstable)
- **Minimal dependencies** — SDK, `chokidar` for watching (or `fs.watch`), nothing else

**Laws:**
- L01-L04: TypeScript strict mode, no `any`, explicit return types, minimal assertions
- L05-L07: Single responsibility per module, dependency injection, side effects behind interfaces
- L14: Truthful naming (no misleading identifiers)

**Style:**
- Flat `src/` directory with specific canonical modules
- Dependency injection for all external dependencies
- Discriminated unions for state modeling
- Result types for expected failures
- Structured logging (no `console.log` in production code)

**Technical Constraints:**
- Project location: `/Users/adam/Development/pharoh/`
- Ushabti plugin path: `/Users/adam/Development/ushabti/`
- SDK types: Available at `/Users/adam/Claude Projects/Alan/reference-source-code/agent-sdk-exploration/node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`

## Acceptance Criteria

- [ ] `npm run build` compiles TypeScript with no errors
- [ ] `npm run typecheck` passes with no type errors
- [ ] `pharaoh serve` starts, writes `service.json` with `status: "idle"`, and begins watching `.ushabti/dispatch/`
- [ ] Dropping a valid dispatch file (markdown with YAML frontmatter) in `.ushabti/dispatch/` triggers SDK execution
- [ ] `service.json` transitions from `idle` → `busy` → `done` (on success) or `blocked` (on failure) → `idle`
- [ ] `service.json` includes required fields at each state: `pid`, `status`, `started`, and contextual fields (`phase`, `cost_usd`, etc.)
- [ ] Sequential queueing works: multiple dispatch files are processed in order, not concurrently
- [ ] SIGTERM and SIGINT signals trigger graceful shutdown: `service.json` is removed, process exits cleanly
- [ ] `service.log` contains timestamped, human-readable entries for: server start, dispatch file picked up, phase start, phase completion, server stop, errors
- [ ] Malformed dispatch files (invalid YAML, missing body, parse errors) are logged, deleted, and do not crash the server or block idle state
- [ ] The Ushabti plugin is successfully loaded from the configured local path
- [ ] The `ir-kat` skill is successfully invoked via the SDK with the PHASE_PROMPT content from the dispatch file body

## Risks / Notes

**Deferred for Phase 2+:**
- **Git operations** — Pharaoh will not create branches, commit changes, or open PRs in this phase. We will verify the phase loop works, then add git automation.
- **Progress extraction** — `service.json` will not include `current_agent` or `current_step` fields. These require hooks to parse SDK message streams. Deferred until we understand the message stream format in practice.
- **Human feedback** — `AskUserQuestion` is blocked via `PreToolUse` hook with "proceed with your best judgement." No filesystem-based feedback mechanism in this phase.
- **Unit tests** — We will prove correctness by running the server and observing behavior. Unit tests will be added once the architecture stabilizes.

**Intentional Simplifications:**
- **No retry logic** — If the SDK call fails, it fails. The phase is marked blocked. Retries can be added later if needed.
- **No dispatch file validation beyond parse** — We parse frontmatter and body. We do NOT validate that the phase slug exists or that the model is supported. The SDK will handle invalid models.
- **No progress persistence during execution** — If the process crashes mid-phase, the phase is lost. Phase progress is only persisted when the SDK completes.

**Key Dependencies:**
- `@anthropic-ai/claude-agent-sdk` (V1 stable)
- `chokidar` for filesystem watching (or Node's built-in `fs.watch` if simpler)
- `js-yaml` for parsing dispatch file frontmatter
- `gray-matter` (alternative to `js-yaml` + manual parsing)
