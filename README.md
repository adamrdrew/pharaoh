# Pharaoh

A headless job runner for the [Ushabti](https://github.com/adamrdrew/ushabti) development framework, built on the [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/sdk).

Pharaoh watches a dispatch directory for markdown files, feeds them through the Ushabti Scribe-Builder-Overseer loop via the Agent SDK, manages git branching and pull requests, and reports status through a JSON file on disk. It runs unattended -- no terminal, no human in the loop.

## Prerequisites

- Node.js 20 or later
- An Anthropic API key set in the environment (`ANTHROPIC_API_KEY`)
- A project with [Ushabti](https://github.com/adamrdrew/ushabti) configured (`.ushabti/` directory with `laws.md`, `style.md`, etc.)
- Git (optional, for automated branching and PRs)
- [GitHub CLI (`gh`)](https://cli.github.com/) (optional, for automated pull request creation)

## Quick start

From your project directory (the one with `.ushabti/`):

```bash
npx @adamrdrew/pharaoh serve
```

Pharaoh will:
1. Create `.pharaoh/` and `.pharaoh/dispatch/` if they don't exist
2. Write `.pharaoh/pharaoh.json` with status `idle`
3. Begin watching `.pharaoh/dispatch/` for `.md` files
4. Log all activity to `.pharaoh/pharaoh.log`

To run a phase, drop a dispatch file into the dispatch directory:

```bash
cat > .pharaoh/dispatch/my-feature.md << 'EOF'
---
phase: add-login-page
model: opus
---

Build a login page with email and password fields.
Validate that both fields are non-empty before submission.
EOF
```

Pharaoh picks up the file, deletes it, executes the Ushabti loop, and writes the result to `pharaoh.json`. When it finishes, it returns to `idle` and is ready for the next job.

## Usage

### Starting the server

```bash
npx @adamrdrew/pharaoh serve [--model <model>]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--model` | `claude-opus-4-20250514` | Claude model to use for phase execution |

The server runs in the foreground and responds to SIGTERM and SIGINT (Ctrl+C) for graceful shutdown.

### Dispatch file format

Dispatch files are markdown with optional YAML frontmatter:

```markdown
---
phase: my-phase-name
model: opus
---

Your phase prompt goes here. This is the content that gets
passed to the Ushabti ir-kat skill as the PHASE_PROMPT.
```

**Frontmatter fields:**

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `phase` | No | `unnamed-phase` | Human-readable name. Appears in logs, status, git branch names. |
| `model` | No | `opus` | Model identifier passed to the Agent SDK. |

**Rules:**
- The body (everything after the `---` closing delimiter) must be non-empty.
- Frontmatter must be valid YAML.
- Malformed files are logged as errors and deleted without blocking the server.

### Monitoring status

Read `.pharaoh/pharaoh.json` to check what Pharaoh is doing:

```bash
cat .pharaoh/pharaoh.json
```

The file is one of four shapes, determined by the `status` field:

**`idle`** -- ready for work:
```json
{
  "status": "idle",
  "pid": 48210,
  "started": "2026-02-09T15:00:00.000Z"
}
```

**`busy`** -- executing a phase:
```json
{
  "status": "busy",
  "pid": 48210,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "add-login-page",
  "phaseStarted": "2026-02-09T15:01:00.000Z"
}
```

**`done`** -- phase completed successfully:
```json
{
  "status": "done",
  "pid": 48210,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "add-login-page",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "phaseCompleted": "2026-02-09T15:05:00.000Z",
  "costUsd": 0.45,
  "turns": 12
}
```

**`blocked`** -- phase failed:
```json
{
  "status": "blocked",
  "pid": 48210,
  "started": "2026-02-09T15:00:00.000Z",
  "phase": "add-login-page",
  "phaseStarted": "2026-02-09T15:01:00.000Z",
  "phaseCompleted": "2026-02-09T15:05:00.000Z",
  "error": "Max turns reached",
  "costUsd": 1.20,
  "turns": 200
}
```

Status transitions follow this state machine:

```
idle --> busy --> done --> idle
                \--> blocked --> idle
```

The file is written atomically (write to `.tmp`, then rename), so partial reads are not possible.

### Monitoring logs

```bash
tail -f .pharaoh/pharaoh.log
```

Log entries are timestamped and structured:

```
[2026-02-09 15:00:00] [INFO] Pharaoh server starting {"pid":48210,"cwd":"/home/user/my-project"}
[2026-02-09 15:00:00] [INFO] Watcher started {"path":"/home/user/my-project/.pharaoh/dispatch"}
[2026-02-09 15:01:00] [INFO] Processing dispatch file {"path":"..."}
[2026-02-09 15:01:00] [INFO] Dispatch file parsed {"phase":"add-login-page","model":"opus"}
[2026-02-09 15:01:00] [INFO] Created feature branch {"branch":"pharaoh/add-login-page"}
[2026-02-09 15:01:00] [INFO] Starting phase execution {"phase":"add-login-page"}
[2026-02-09 15:05:00] [INFO] Phase completed successfully {"phase":"add-login-page","turns":12,"costUsd":0.45}
[2026-02-09 15:05:00] [INFO] Pushed branch {"branch":"pharaoh/add-login-page"}
[2026-02-09 15:05:00] [INFO] Opened pull request {"phase":"add-login-page"}
```

Log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`.

### Stopping the server

Send SIGTERM or SIGINT:

```bash
kill -TERM $(jq -r .pid .pharaoh/pharaoh.json)
# or just Ctrl+C if running in the foreground
```

Pharaoh shuts down gracefully: stops the watcher, removes `pharaoh.json`, and logs the shutdown.

## Git integration

When Pharaoh runs inside a git repository, it automates the branching and PR workflow around each phase.

### Before a phase runs

1. Checks that the current branch is `main` or `master`
2. Checks that the working tree is clean
3. Pulls latest changes from the remote
4. Creates a feature branch named `pharaoh/<phase-slug>` (e.g., `pharaoh/add-login-page`)

If any check fails, it logs a warning and continues with phase execution anyway.

### After a successful phase

1. Stages all changes (`git add -A`)
2. Commits with the message: `Phase <name> complete`
3. Pushes the branch to origin
4. Opens a pull request via `gh pr create` (if the GitHub CLI is installed)

If `gh` is not available, steps 1-3 still run and the log tells you to create the PR manually.

### Non-git environments

When not inside a git repository, all git operations are silently skipped. Pharaoh works anywhere.

## How it works

Pharaoh is a long-running process that converts filesystem events into Ushabti phase executions.

### Execution flow

1. A `.md` file appears in `.pharaoh/dispatch/`
2. The watcher detects the file via [chokidar](https://github.com/paulmillr/chokidar)
3. Pharaoh reads and parses the frontmatter and body, then deletes the dispatch file
4. Status is set to `busy`
5. Git pre-phase: branch creation from `main`
6. The phase prompt is sent to the Claude Agent SDK, which invokes the Ushabti `/ir-kat` skill (Scribe plans, Builder implements, Overseer reviews)
7. After the SDK query completes, a lightweight verification query checks that the Ushabti loop actually reached a terminal state
8. Git post-phase: commit, push, and PR (on success only)
9. Status is set to `done` or `blocked`, then back to `idle`

### Concurrency

Pharaoh processes one job at a time. If a dispatch file arrives while a phase is running, it is queued and processed when the current phase finishes. Jobs are processed in the order they arrive.

### Agent autonomy

Pharaoh blocks the `AskUserQuestion` tool via a `PreToolUse` hook. When the agent tries to ask a question, it receives "Proceed with your best judgement" and continues autonomously. This is what makes Pharaoh headless -- no human interaction is required or possible during execution.

### Phase verification

After the main SDK query finishes, Pharaoh runs a second, lightweight query using `/phase-status latest` (with a 10-turn limit on Sonnet) to confirm the Ushabti loop reached a terminal state. If the phase is still in an incomplete state like `building` or `planned`, the result is reported as `blocked` even if the SDK query itself returned successfully. This prevents false positives from early agent exits.

## Project structure

```
.pharaoh/
  dispatch/        # Drop .md files here to trigger phases
  pharaoh.json     # Current server status (atomic writes)
  pharaoh.log      # Structured log file

.ushabti/          # Ushabti framework configuration
  laws.md          # Project invariants
  style.md         # Code conventions
  docs/            # Project documentation
  phases/          # Numbered phase directories
```

## Development

To work on Pharaoh itself:

```bash
git clone git@github.com:adamrdrew/pharaoh.git
cd pharaoh
npm install
npm run build        # TypeScript compilation
npm run typecheck    # Type-check without emitting
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run serve        # Run from source via tsx
```

## License

MIT
