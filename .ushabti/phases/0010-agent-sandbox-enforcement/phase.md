# Phase 0010: Agent Sandbox Enforcement

## Intent

Prevent the spawned Claude Code agent from escaping the sandbox and traversing the user's filesystem during Pharaoh runs. Block all attempts to disable the sandbox via `dangerouslyDisableSandbox` and enforce path boundaries on filesystem tools to restrict access to approved directories only.

## Scope

**In scope:**
- Block `dangerouslyDisableSandbox` flag on all Bash tool calls via `PreToolUse` hook
- Enforce path validation on `Read`, `Write`, `Edit`, `Glob`, `Grep` tools
- Allow `config.cwd` (project directory) by default in path allowlist
- Normalize paths with `path.resolve()` to catch traversal attempts (`../`)
- Tests for all blocking conditions (sandbox flag, external paths, traversal)

**Out of scope:**
- Parsing Bash command strings for path extraction (sandbox already restricts Bash filesystem access)
- Changes to `createSecurityOptions` (sandbox config is correct)
- Changes to `RunnerConfig` type (allowlist built inside `createHookOptions`)
- Additional allowlist directories beyond `config.cwd` (deferred to future Phase)
- Hook behavior for non-filesystem tools (already allowed)

## Constraints

- L02: No `any` type
- L03: Type assertions only at system boundaries with runtime validation
- L04: Explicit return types on all functions
- L06: Dependency injection required (`config.cwd` threaded to hook)
- L09: All conditional paths covered by tests
- Sandi Metz: Functions max 5 lines, max 4 parameters
- Descriptive test names that read like specifications

## Acceptance Criteria

1. **Sandbox flag blocked** — Any Bash tool call with `dangerouslyDisableSandbox: true` returns a block decision with a clear message
2. **Path validation enforced** — All filesystem tools (`Read`, `Write`, `Edit`, `Glob`, `Grep`) with paths outside `config.cwd` are blocked
3. **Path traversal caught** — Paths using `../` that resolve outside `config.cwd` are blocked
4. **Optional paths allowed** — Tools with optional path fields (Glob, Grep) pass validation when field is absent (defaults to cwd)
5. **All tests pass** — Unit tests cover all blocking conditions and success paths
6. **No TCC popups** — A Pharaoh run completes without triggering macOS permission dialogs for Photos, Documents, Desktop, Library, or iCloud Drive

## Risks / Notes

- **Bash command parsing explicitly excluded** — The Claude Code sandbox already restricts Bash filesystem access. With `dangerouslyDisableSandbox` blocked, the agent cannot escape the Bash sandbox. Do not attempt to parse command strings.
- **Future allowlist expansion** — This Phase only allows `config.cwd`. A future Phase can extend `createHookOptions` to accept additional allowed paths via configuration if needed.
