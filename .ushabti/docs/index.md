# Project Documentation

## Project Name

Pharaoh

## Description

A filesystem-based job runner built on the Claude Agent SDK. Pharaoh watches a dispatch directory for markdown files containing phase prompts, executes them via the Claude Agent SDK's `ir-kat` skill (which runs the Ushabti Scribe → Builder → Overseer loop), and reports status through a JSON file on disk.

## Table of Contents

- [How to Run](#how-to-run)
- [Dispatch File Format](#dispatch-file-format)
- [Status File Schema](#status-file-schema)
- [Event Stream](#event-stream)
- [Pharaoh Log](#pharaoh-log)
- [Git Integration](#git-integration)
- [Architecture](#architecture)

## How to Run

### Prerequisites

- Node.js 20.x or later
- Ushabti plugin as local npm dependency (included via `npm install`)

### Starting the Server

```bash
npm install
npm run build
pharaoh serve [--model <model>]
```

The `--model` argument is optional and specifies the model to use (defaults to `claude-opus-4-20250514`). The Ushabti plugin is resolved automatically from `node_modules` via npm's local file dependency mechanism.

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

`pharaoh.json` reflects the current server state. The schema is a discriminated union based on `status`.

All status shapes include metadata fields providing information about the server configuration and state:

- `pharaohVersion`: Pharaoh's package.json version (read once at startup)
- `ushabtiVersion`: Ushabti dependency's package.json version (read once at startup)
- `model`: Model ID configured at startup (from `--model` flag or default)
- `cwd`: Current working directory (process.cwd())
- `phasesCompleted`: Counter of successfully completed phases (increments only on done transitions, not on blocked)

### Idle

Server is ready to accept dispatch files.

```json
{
  "status": "idle",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "pharaohVersion": "0.1.8",
  "ushabtiVersion": "1.9.5",
  "model": "claude-opus-4-20250514",
  "cwd": "/Users/adam/Development/my-project",
  "phasesCompleted": 0
}
```

### Busy

Server is executing a phase. The `turnsElapsed` and `runningCostUsd` fields provide real-time progress during execution. The `gitBranch` field is only present during busy status.

```json
{
  "status": "busy",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "my-phase",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "turnsElapsed": 5,
  "runningCostUsd": 0.12,
  "pharaohVersion": "0.1.8",
  "ushabtiVersion": "1.9.5",
  "model": "claude-opus-4-20250514",
  "cwd": "/Users/adam/Development/my-project",
  "phasesCompleted": 2,
  "gitBranch": "pharaoh/my-phase"
}
```

**Fields:**
- `turnsElapsed`: Number of assistant messages (turns) processed so far
- `runningCostUsd`: Accumulated cost in USD based on token usage (heuristic using Opus 4 pricing: $15/MTok input, $75/MTok output)
- `gitBranch`: Current git feature branch created for this phase (only present in busy status)

**Note:** The `runningCostUsd` is a real-time estimate. The final `costUsd` in the `done` or `blocked` status is the authoritative cost from the SDK.

### Done

Phase completed successfully. Note that `phasesCompleted` increments after each successful phase completion.

```json
{
  "status": "done",
  "pid": 12345,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "my-phase",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "phaseCompleted": "2026-02-09T15:05:00.000Z",
  "costUsd": 0.45,
  "turns": 12,
  "pharaohVersion": "0.1.8",
  "ushabtiVersion": "1.9.5",
  "model": "claude-opus-4-20250514",
  "cwd": "/Users/adam/Development/my-project",
  "phasesCompleted": 3
}
```

### Blocked

Phase failed or encountered an error. Note that `phasesCompleted` does not increment on blocked transitions.

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
  "turns": 200,
  "pharaohVersion": "0.1.8",
  "ushabtiVersion": "1.9.5",
  "model": "claude-opus-4-20250514",
  "cwd": "/Users/adam/Development/my-project",
  "phasesCompleted": 2
}
```

### State Transitions

```
idle → busy → done → idle
       ↓      ↓
       → blocked → idle
```

## Event Stream

Pharaoh captures detailed SDK message events during phase execution and writes them to `.pharaoh/events.jsonl` in JSON Lines format.

### Format

Events are written as newline-delimited JSON objects (JSON Lines):

```
{"timestamp":"2026-02-09T15:01:00.123Z","type":"turn","summary":"Turn 1","detail":{"turn":1,"input_tokens":1234,"output_tokens":567}}
{"timestamp":"2026-02-09T15:01:05.456Z","type":"tool_call","summary":"Tool: Read","detail":{"tool_use_id":"toolu_abc123","tool_name":"Read","input":"{\"file_path\":\"/path/to/file.ts\"}"}}
```

### Event Schema

Each event has the following fields:

- `timestamp` (string, required): ISO8601 timestamp when the event was captured
- `type` (string, required): Event type discriminator (see Event Types table)
- `summary` (string, required): Human-readable event summary (truncated for brevity)
- `agent` (string, optional): Agent name (e.g., "Scribe", "Builder", "Overseer") — currently unpopulated, reserved for future use
- `detail` (object, optional): Structured detail object with event-specific fields

### Event Types

| Type | Description | Detail Fields |
|------|-------------|---------------|
| `tool_call` | Tool invocation by assistant | `tool_use_id`, `tool_name`, `input` (truncated to 500 chars) |
| `tool_progress` | Tool execution progress update | `tool_use_id`, `elapsed_millis` |
| `tool_summary` | Tool execution completion | `tool_use_ids`, summary text |
| `text` | Text output from assistant | `full_text` (summary truncated to 200 chars) |
| `turn` | Assistant message (conversation turn) | `turn`, `input_tokens`, `output_tokens` |
| `status` | SDK status update or initialization | `status`, `model`, `tools_count`, `plugins_count` |
| `result` | Phase completion | `turns`, `cost_usd` |
| `error` | Phase failure | `errors`, `turns`, `cost_usd` |

### Event Lifecycle

- **Cleared on phase start**: Events file is truncated when a new phase begins
- **Append-only during execution**: Events are written as they arrive from the SDK
- **No rotation or size limits**: Long phases may produce large event files
- **File-based polling**: External consumers (like Hieroglyphs) poll the file for updates

### Truncation and Debouncing

- **Tool inputs**: Truncated to 500 characters in the `detail.input` field
- **Text blocks**: Summary truncated to 200 characters; full text in `detail.full_text`
- **Tool progress**: Debounced to maximum once per 5 seconds per tool to reduce I/O overhead

### Example Events

**Turn event:**
```json
{
  "timestamp": "2026-02-09T15:01:00.123Z",
  "type": "turn",
  "summary": "Turn 1",
  "detail": {
    "turn": 1,
    "input_tokens": 1234,
    "output_tokens": 567
  }
}
```

**Tool call event:**
```json
{
  "timestamp": "2026-02-09T15:01:05.456Z",
  "type": "tool_call",
  "summary": "Tool: Read",
  "detail": {
    "tool_use_id": "toolu_abc123",
    "tool_name": "Read",
    "input": "{\"file_path\":\"/path/to/file.ts\"}"
  }
}
```

**Result event:**
```json
{
  "timestamp": "2026-02-09T15:05:00.789Z",
  "type": "result",
  "summary": "Phase complete: 12 turns, $0.45",
  "detail": {
    "turns": 12,
    "cost_usd": 0.45
  }
}
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

## Git Integration

Pharaoh automates git workflows around phase execution when running in a git repository.

### Pre-Phase Operations

Before executing a phase, Pharaoh:

1. Verifies the current directory is a git repository
2. Checks that the current branch is `main` or `master`
3. Ensures the working tree is clean (no uncommitted changes)
4. Pulls latest changes from the remote
5. Creates a feature branch named `pharaoh/{phase-slug}` (e.g., `pharaoh/my-phase-name`)

If any check fails, the operation is logged as a warning but does not block phase execution.

### Post-Phase Operations (Green Phases Only)

After a phase completes successfully (`done` status), Pharaoh:

1. Stages all changes (`git add -A`)
2. Commits with message: `Phase {phase-name} complete\n\nCo-Authored-By: Pharaoh <noreply@pharaoh>`
3. Pushes the branch to remote (`git push -u origin pharaoh/{phase-slug}`)
4. Opens a pull request via `gh` CLI (if installed and authenticated)

If `gh` CLI is not available, steps 1-3 still complete and a message is logged with instructions to manually create the PR.

### Non-Git Environments

When Pharaoh runs in a directory that is not a git repository, all git operations are silently skipped. This allows Pharaoh to work in any environment without requiring git configuration.

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

- **Plugin**: Ushabti plugin resolved from `node_modules` via npm dependency
- **Model**: Configurable via `--model` flag (defaults to `claude-opus-4-20250514`)
- **Permissions**: Bypass mode with sandbox enabled
- **Max turns**: 200 for main phase execution
- **Hooks**: `PreToolUse` blocks `AskUserQuestion` with message "Proceed with your best judgement"

### Phase Status Verification

After the main SDK query completes, Pharaoh verifies that the ir-kat loop reached a terminal state by reading the phase status directly from the filesystem. It scans `.ushabti/phases/` to find the most recently modified phase directory, reads `progress.yaml` from that directory, and extracts the `status` field. If the status is not `complete`, `reviewing`, or `done`, the result is reported as blocked even if the SDK query succeeded. This prevents false positives when the agent loop exits early and eliminates the parsing failures that occurred with the previous agent-based verification approach.

## Future Work

Deferred features:

- **Progress extraction**: Current agent and step tracking from SDK message stream
- **Human feedback**: Filesystem-based mechanism for `AskUserQuestion`
- **Retry logic**: Failed phases stay blocked; retries are manual
- **Advanced queueing**: Prioritization, cancellation, or concurrent execution
- **Git configuration**: Branch naming patterns, PR templates, and commit message customization
