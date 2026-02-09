# Project Documentation

## Project Name

Pharaoh

## Description

A filesystem-based job runner built on the Claude Agent SDK. Pharaoh watches a dispatch directory for markdown files containing phase prompts, executes them via the Claude Agent SDK's `ir-kat` skill (which runs the Ushabti Scribe → Builder → Overseer loop), and reports status through a JSON file on disk.

## Table of Contents

- [How to Run](#how-to-run)
- [Dispatch File Format](#dispatch-file-format)
- [Status File Schema](#status-file-schema)
- [Service Log](#service-log)
- [Architecture](#architecture)

## How to Run

### Prerequisites

- Node.js 20.x or later
- Ushabti plugin installed locally

### Starting the Server

```bash
npm install
npm run build
pharaoh serve --plugin-path /path/to/ushabti
```

The `--plugin-path` argument is required and specifies the location of the Ushabti plugin. An optional `--model` argument can specify the model to use (defaults to `claude-opus-4-20250514`).

### Running Tests

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

The server will:
1. Create `pharaoh.json` with status `idle`
2. Start watching `.pharaoh/dispatch/` for `.md` files
3. Log startup events to `pharaoh.log`

### Dispatching a Phase

Create a markdown file in `.pharaoh/dispatch/` with YAML frontmatter:

```bash
cat > .pharaoh/dispatch/my-phase.md << 'EOF'
---
phase: my-phase-name
model: opus
---

Your PHASE_PROMPT content here...
EOF
```

The server will:
1. Detect the file
2. Parse frontmatter and body
3. Delete the dispatch file
4. Update `pharaoh.json` to `busy`
5. Invoke `/ir-kat` via Claude Agent SDK
6. Update `pharaoh.json` to `done` or `blocked`
7. Return to `idle`

### Stopping the Server

Send SIGTERM or SIGINT (Ctrl+C):

```bash
kill -TERM <pid>
```

The server performs graceful shutdown:
- Stops the watcher
- Removes `pharaoh.json`
- Logs shutdown event

## Dispatch File Format

Dispatch files are markdown with YAML frontmatter:

```markdown
---
phase: phase-name       # Optional: phase identifier
model: opus            # Optional: model to use (default: opus)
---

# PHASE_PROMPT

This content is passed to the ir-kat skill as the PHASE_PROMPT.
```

### Frontmatter Fields

- `phase` (optional): Human-readable phase name. Appears in logs and status.
- `model` (optional): Model identifier. Defaults to `opus`.

### Body

The body (everything after `---`) is the PHASE_PROMPT passed to `/ir-kat`.

### Validation

- Frontmatter must be valid YAML
- Body must be non-empty
- Malformed files are logged as errors and deleted without blocking the server

## Status File Schema

`pharaoh.json` reflects the current server state. The schema is a discriminated union based on `status`:

### Idle

Server is ready to accept dispatch files.

```json
{
  "status": "idle",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z"
}
```

### Busy

Server is executing a phase.

```json
{
  "status": "busy",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "my-phase",
  "phaseStarted": "2026-02-09T15:01:00.000Z"
}
```

### Done

Phase completed successfully.

```json
{
  "status": "done",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "my-phase",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "phaseCompleted": "2026-02-09T15:05:00.000Z",
  "costUsd": 0.45,
  "turns": 12
}
```

### Blocked

Phase failed or encountered an error.

```json
{
  "status": "blocked",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "my-phase",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "phaseCompleted": "2026-02-09T15:05:00.000Z",
  "error": "Max turns reached",
  "costUsd": 1.20,
  "turns": 200
}
```

### State Transitions

```
idle → busy → done → idle
       ↓      ↓
       → blocked → idle
```

## Pharaoh Log

`pharaoh.log` contains timestamped, human-readable log entries:

```
[2026-02-09 15:00:00] [INFO] Pharaoh server starting {"pid":12345,"cwd":"/path/to/project"}
[2026-02-09 15:00:00] [INFO] Pharaoh starting {"version":"0.1.0","cwd":"/path/to/project"}
[2026-02-09 15:00:00] [INFO] Serving directory {"cwd":"/path/to/project","dispatchPath":"/path/to/project/.pharaoh/dispatch"}
[2026-02-09 15:00:00] [INFO] Watcher started {"path":"/path/to/project/.pharaoh/dispatch"}
[2026-02-09 15:00:00] [INFO] Pharaoh server ready {"dispatchPath":"/path/to/project/.pharaoh/dispatch"}
[2026-02-09 15:01:00] [INFO] Processing dispatch file {"path":"..."}
[2026-02-09 15:01:00] [INFO] Dispatch file parsed {"phase":"my-phase","model":"opus"}
[2026-02-09 15:01:00] [INFO] Starting phase execution {"phase":"my-phase"}
[2026-02-09 15:05:00] [INFO] Phase completed successfully {"phase":"my-phase","turns":12,"costUsd":0.45,"durationMs":240000}
```

### Log Levels

- `DEBUG`: Verbose internal state (SDK messages, turn counts)
- `INFO`: Normal operations (server start, file processed, phase complete)
- `WARN`: Recoverable errors (file disappeared, transient failures)
- `ERROR`: Unrecoverable errors (parse failures, SDK errors)

## Architecture

### Modules

Pharaoh uses a flat `src/` directory with single-responsibility modules:

- `index.ts` — CLI entry point, server initialization, and version reading
- `types.ts` — Discriminated union types for status and results
- `status.ts` — Atomic reads/writes for `pharaoh.json`
- `log.ts` — Structured logging to `pharaoh.log`
- `parser.ts` — Dispatch file parsing (frontmatter + body)
- `runner.ts` — SDK query execution via `ir-kat` skill
- `watcher.ts` — Dispatch directory watcher with sequential queueing
- `filesystem.ts` — Real filesystem implementation (production)

### Testing

Pharaoh uses vitest for testing. Tests are located in `tests/` and mirror the structure of `src/`. All tests use fake implementations of the `Filesystem` interface to avoid touching the real filesystem (Law L08).

### Dependency Injection

All side effects (filesystem, SDK calls) are abstracted behind interfaces and injected as dependencies. This supports testing and follows the Open/Closed Principle.

### Concurrency Model

- **One job at a time**: Only one dispatch file is processed at a time
- **Sequential queueing**: Files detected while busy are queued and processed in order
- **Busy flag**: Prevents concurrent execution

### SDK Configuration

Pharaoh invokes the Claude Agent SDK with:

- **Plugin**: Ushabti plugin from local path
- **Model**: Configurable (defaults to `opus`)
- **Permissions**: Bypass mode with sandbox enabled
- **Max turns**: 200
- **Hooks**: `PreToolUse` blocks `AskUserQuestion` with message "Proceed with your best judgement"

## Future Work

Phase 1 (this phase) does NOT include:

- **Git integration**: Branching, committing, and PR creation are deferred
- **Progress extraction**: Current agent and step tracking from SDK message stream
- **Human feedback**: Filesystem-based mechanism for `AskUserQuestion`
- **Retry logic**: Failed phases stay blocked; retries are manual
- **Advanced queueing**: Prioritization, cancellation, or concurrent execution

These features are intentionally deferred to keep this phase focused on proving the core loop works.
