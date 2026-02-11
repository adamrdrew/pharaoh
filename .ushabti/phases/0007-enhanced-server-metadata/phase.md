# Phase 0007: Enhanced Server Metadata

## Intent

Add comprehensive server metadata to `pharaoh.json` so external consumers (Hieroglyphs UI, CLI tools, manual inspection) can understand exactly what version of Pharaoh and Ushabti is running, what model is configured, where it's running, how many phases have completed, and (during busy status) which git branch is active.

This eliminates ambiguity about server configuration and state when debugging or monitoring multiple Pharaoh instances.

## Scope

**In scope:**
- Add six new fields to all status shapes (idle, busy, done, blocked):
  - `pharaohVersion`: Pharaoh's own package.json version
  - `ushabtiVersion`: Installed ushabti dependency's package.json version
  - `model`: Model ID passed at startup (--model flag or default)
  - `cwd`: Current working directory (process.cwd())
  - `phasesCompleted`: Counter incremented on each done transition
  - `gitBranch`: Current git branch (only present during busy status)
- Read versions once at startup and hold in memory
- Increment `phasesCompleted` counter on each done transition
- Include `gitBranch` only in busy status writes

**Out of scope:**
- Changing existing status field names or semantics
- Adding additional metadata beyond these six fields
- Exposing SDK or plugin configuration beyond model ID
- Tracking phases that ended in blocked status

## Constraints

**Type Safety (L02, L03, L04):**
- All new fields must be properly typed in discriminated union types
- No `any` types or type assertions except at validated system boundaries
- Explicit return types on all public functions

**Dependency Injection (L06, L07):**
- Versions and cwd must be passed into StatusManager or status setter functions
- No direct file reads within status module (violation of single responsibility)
- Filesystem operations must use injected Filesystem interface

**Single Responsibility (L05):**
- StatusManager remains focused on status writes
- Version reading happens at startup in server initialization
- Counter state lives in DispatchWatcher (which owns the phase lifecycle)

**Sandi Metz Rules:**
- Keep modules under 100 lines (may require splitting status-setters if it grows)
- Keep functions under 5 lines
- Use options objects for >4 parameters

**Documentation Reconciliation (L15, L17):**
- Update `.ushabti/docs/index.md` to reflect new status schema with all six fields
- Include examples showing idle and busy status with new metadata

## Acceptance Criteria

1. All four status types (idle, busy, done, blocked) include: `pharaohVersion`, `ushabtiVersion`, `model`, `cwd`, `phasesCompleted`
2. Busy status additionally includes `gitBranch` field
3. Idle, done, and blocked statuses do NOT include `gitBranch` field
4. Versions are read once at startup, not on every status write
5. `phasesCompleted` starts at 0 and increments only on done transitions
6. `gitBranch` reflects the feature branch name created during git pre-phase operations
7. Tests verify all new fields are present in each status shape
8. Tests verify `phasesCompleted` increments across multiple phase completions
9. Tests verify `gitBranch` is only present during busy status
10. Documentation in `.ushabti/docs/index.md` updated with new schema and examples

## Risks / Notes

**Version reading location:**
We'll read versions at server startup (in `server.ts` or `server-deps.ts`) and pass them through to status setters. This avoids repeated file I/O and keeps version info consistent for the server's lifetime.

**Counter ownership:**
`phasesCompleted` counter will live in `DispatchWatcher` since it owns the phase execution lifecycle and already tracks `pid` and `started`.

**Git branch source:**
The git branch will be captured after `prepareGitEnvironment` succeeds and passed to runner, which will include it in busy status writes.
