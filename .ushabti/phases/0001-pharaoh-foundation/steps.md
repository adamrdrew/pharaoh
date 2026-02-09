# Steps

## S001 — Project Scaffolding

**Intent:** Establish the TypeScript project structure with strict configuration and minimal dependencies.

**Work:**
- Create `package.json` with project metadata, dependencies (`@anthropic-ai/claude-agent-sdk`, `chokidar`, `gray-matter`), dev dependencies (`typescript`, `@types/node`, `tsx`), and scripts (`build`, `typecheck`, `serve`)
- Create `tsconfig.json` with `strict: true`, ES2022 target, Node.js module resolution
- Create `src/` directory for source files
- Install dependencies via `npm install`

**Done When:**
- `npm run build` runs without errors (even though source is empty)
- `npm run typecheck` passes
- `package.json` lists exact versions for all production dependencies

---

## S002 — Core Types and State Machine

**Intent:** Define the discriminated union types for the service status state machine and dispatch file structure.

**Work:**
- Create `src/types.ts` with:
  - `ServiceStatus` discriminated union (idle, busy, done, blocked variants with required fields)
  - `DispatchFile` type (frontmatter + body)
  - `PhaseResult` discriminated union (success, failure, blocked)
  - Helper type guards for discriminating union variants

**Done When:**
- All state machine variants are represented as discriminated unions
- Type guards allow safe narrowing of union variants
- No `any` types present

---

## S003 — Status Manager

**Intent:** Implement atomic reads and writes for `service.json` with proper state machine transitions.

**Work:**
- Create `src/status.ts` with:
  - `StatusManager` class with injectable filesystem dependency
  - `writeStatus()` method with atomic write (write to temp file, rename)
  - `readStatus()` method with error handling
  - `transition()` method that validates legal state transitions
  - Methods for each transition: `setIdle()`, `setBusy()`, `setDone()`, `setBlocked()`

**Done When:**
- Status manager can write status atomically (no partial file states)
- State transitions enforce the state machine (idle → busy → done/blocked → idle)
- All writes include required fields per state variant
- All methods have explicit return types

---

## S004 — Structured Logger

**Intent:** Create a structured logger that writes timestamped, human-readable entries to `service.log`.

**Work:**
- Create `src/log.ts` with:
  - `Logger` class with injectable filesystem dependency
  - Methods for each log level: `debug()`, `info()`, `warn()`, `error()`
  - Each method writes timestamped entries with structured context
  - Log entries formatted as: `[YYYY-MM-DD HH:MM:SS] [LEVEL] message {context}`

**Done When:**
- Logger can append to `service.log` without overwriting existing entries
- All log entries include timestamp, level, message, and optional structured context
- No `console.log` calls in production code

---

## S005 — Dispatch File Parser

**Intent:** Parse and validate dispatch files (markdown with YAML frontmatter).

**Work:**
- Create `src/parser.ts` with:
  - `parseDispatchFile()` function that parses frontmatter and body
  - Result type return (success with parsed file, or failure with error)
  - Validation: frontmatter must have `phase` (optional) and `model` (optional, default 'opus')
  - Validation: body must be non-empty markdown

**Done When:**
- Parser successfully extracts frontmatter (`phase`, `model`) and body
- Parser returns typed result for success/failure (no throwing on expected failures)
- Malformed files (invalid YAML, empty body) return error result

---

## S006 — SDK Query Runner

**Intent:** Execute a phase via the Claude Agent SDK by invoking the `ir-kat` skill with proper configuration.

**Work:**
- Create `src/runner.ts` with:
  - `PhaseRunner` class with injectable dependencies (logger, status manager)
  - `runPhase()` method that:
    - Constructs SDK `query()` call with options (cwd, model, plugins, sandbox, maxTurns)
    - Invokes `/ir-kat` skill with the PHASE_PROMPT content
    - Consumes the async message stream
    - Logs SDK events to `service.log`
    - Returns `PhaseResult` (success/failure/blocked with cost, duration, turns)
  - `PreToolUse` hook that blocks `AskUserQuestion` and tells agent to proceed with best judgement
  - Error handling for SDK failures (max turns, API errors, process crashes)

**Done When:**
- Runner can invoke the SDK with the Ushabti plugin loaded from `/Users/adam/Development/ushabti/`
- Runner constructs the prompt: `Invoke /ir-kat with the following PHASE_PROMPT: <dispatch body>`
- Runner sets SDK options: `cwd`, `model`, `plugins`, `settingSources: ['project']`, `permissionMode: 'bypassPermissions'`, `allowDangerouslySkipPermissions: true`, `sandbox: { enabled: true, autoAllowBashIfSandboxed: true }`, `maxTurns: 200`
- Runner logs SDK events (turns, tool uses, errors) to `service.log`
- Runner returns typed `PhaseResult` with cost and duration data

---

## S007 — Dispatch Watcher

**Intent:** Watch `.ushabti/dispatch/` for new markdown files and queue them for execution.

**Work:**
- Create `src/watcher.ts` with:
  - `DispatchWatcher` class with injectable dependencies (filesystem, parser, runner, status, logger)
  - `start()` method that initializes watch on `.ushabti/dispatch/` directory
  - `stop()` method that cleans up watcher and event listeners
  - Event handler that:
    - Detects new `.md` files
    - Ignores files if busy
    - Reads, parses, and deletes the dispatch file
    - Transitions to busy, invokes runner, transitions to done/blocked, returns to idle
    - On malformed file: logs error, deletes file, stays idle
  - Sequential queueing: check for queued files when returning to idle

**Done When:**
- Watcher detects new `.md` files in `.ushabti/dispatch/`
- Watcher ignores new files while busy (implicit queueing)
- Watcher processes queued files in order (oldest first) when returning to idle
- Malformed files are logged and deleted without crashing or blocking idle state
- Watcher cleans up resources on `stop()`

---

## S008 — CLI Entry Point

**Intent:** Provide the `pharaoh serve` command that starts the server and handles signals.

**Work:**
- Create `src/index.ts` with:
  - CLI argument parsing (only `serve` command for now)
  - Instantiate dependencies (real implementations of filesystem, logger, status, runner, watcher)
  - Start the watcher
  - Register SIGTERM and SIGINT handlers for graceful shutdown
  - Graceful shutdown: stop watcher, remove `service.json`, log shutdown, exit cleanly

**Done When:**
- `pharaoh serve` starts the server and writes `service.json` with `status: "idle"`
- SIGTERM and SIGINT trigger graceful shutdown (cleanup and exit with code 0)
- Uncaught errors are logged before exiting

---

## S009 — Integration Smoke Test

**Intent:** Manually verify the end-to-end workflow by running the server and dispatching a test phase.

**Work:**
- Start the server: `pharaoh serve`
- Verify `service.json` is created with `status: "idle"`
- Create a test dispatch file with valid frontmatter and a minimal PHASE_PROMPT
- Drop the dispatch file in `.ushabti/dispatch/`
- Observe:
  - `service.json` transitions to `busy`
  - `service.log` shows phase execution events
  - `service.json` transitions to `done` or `blocked`
  - `service.json` returns to `idle`
- Test sequential queueing: drop 2 dispatch files, verify they execute in order
- Test malformed file: drop an invalid dispatch file, verify it's logged and deleted
- Test graceful shutdown: send SIGTERM, verify `service.json` is removed

**Done When:**
- All acceptance criteria pass when tested manually
- Server handles dispatch files correctly
- Server logs readable timeline to `service.log`
- Server shuts down cleanly on signal

---

## S010 — Documentation Reconciliation

**Intent:** Update project documentation to reflect the new Pharaoh server.

**Work:**
- Read `.ushabti/docs/index.md`
- Update documentation to describe:
  - What Pharaoh is (filesystem-based job runner)
  - How to run it (`pharaoh serve`)
  - Dispatch file format (markdown with YAML frontmatter)
  - Status file schema (`service.json` fields and state machine)
  - Log file location and format (`service.log`)
- Add note that tests are deferred (will be added in a future phase)

**Done When:**
- `.ushabti/docs/index.md` accurately describes Pharaoh's capabilities and usage
- No stale or contradictory information exists

---

## F001 — Remove Type Assertions in parser.ts

**Intent:** Replace unsafe type assertions with runtime type validation in dispatch file parser.

**Work:**
- Remove type assertions on lines 36-37 in `src/parser.ts`
- Add runtime type checks: `typeof parsed.data.phase === 'string'` and `typeof parsed.data.model === 'string'`
- Ensure undefined is returned when values are not strings

**Done When:**
- No type assertions (`as` keyword) remain in parser.ts
- Frontmatter values are validated at runtime before use
- Invalid types result in undefined, not runtime type errors

---

## F002 — Add Runtime Validation for status.ts JSON Parse

**Intent:** Validate parsed JSON structure before treating it as ServiceStatus.

**Work:**
- Create type guard function `isValidServiceStatus(value: unknown): value is ServiceStatus`
- Validate that parsed JSON has required fields based on status discriminator
- Return ReadResult error when validation fails instead of assuming structure

**Done When:**
- JSON.parse result is validated before use
- Malformed service.json returns typed ReadResult error
- No type assertions on JSON.parse results

---

## F003 — Replace console.error with Logger or Document Exception

**Intent:** Remove console.error usage or explicitly justify as bootstrap exception.

**Work:**
- Evaluate line 100 in `src/index.ts`
- Either:
  1. Remove console.error and use process.exit silently, or
  2. Initialize a minimal logger before arg parsing for error reporting, or
  3. Document this as an explicit bootstrap exception (error before logger exists)

**Done When:**
- Either console.error is removed, replaced with logger, or explicitly justified
- Decision is clear and documented in code comments if exception is granted
