# Implementation Steps

## S001: Fix debug log terminology

**Intent**: Rename `turnCounter` and the `turn` log field to accurately reflect that they count assistant messages, not API turns.

**Work**:
- Rename `turnCounter` variable to `messageCounter` in `runner.ts`
- Update debug log field from `"turn"` to `"message"` in `runner-messages.ts`
- Verify "turn" only appears in completion logs sourced from SDK's `num_turns`

**Done when**:
- All occurrences of `turnCounter` renamed to `messageCounter`
- Debug logs emit `{"phase":"...","message":N}` not `{"phase":"...","turn":N}`
- `npm run build` succeeds

## S002: Add package.json to Ushabti

**Intent**: Make Ushabti resolvable as an npm dependency by adding minimal package metadata.

**Work**:
- Create `/Users/adam/Development/ushabti/package.json` with `"name": "ushabti"` and `"version": "1.8.0"`
- Mark as `"private": true` since it's not published to npm
- No scripts, dependencies, or main field needed — it's a plugin directory, not a Node package

**Done when**:
- File `/Users/adam/Development/ushabti/package.json` exists
- Contains valid JSON with `name` and `version` fields
- Can be resolved by npm's file dependency mechanism

## S003: Add Ushabti as local dependency

**Intent**: Declare Ushabti in Pharaoh's `package.json` and run `npm install` to link it.

**Work**:
- Add `"ushabti": "file:../ushabti"` to `dependencies` in Pharaoh's `package.json`
- Run `npm install` to create symlink in `node_modules/ushabti`
- Verify Ushabti appears in `node_modules`

**Done when**:
- `package.json` dependencies include Ushabti
- `npm install` completes successfully
- `node_modules/ushabti` symlink exists and points to `/Users/adam/Development/ushabti`

## S004: Resolve plugin path at runtime

**Intent**: Replace `--plugin-path` CLI argument with automatic resolution via `require.resolve`.

**Work**:
- Create new module `plugin-resolver.ts` with function `resolvePluginPath(): string`
- Use `createRequire(import.meta.url)` to get CommonJS require function
- Call `require.resolve('ushabti/package.json')` to get package.json path
- Extract parent directory (plugin root) from resolved path
- Catch resolution errors and throw descriptive error: "ushabti not found — run npm install"
- Add explicit return type and follow style guide (5-line functions)

**Done when**:
- `plugin-resolver.ts` exists with `resolvePluginPath()` function
- Function returns path to Ushabti plugin directory
- Throws clear error if Ushabti not installed
- `npm run build` succeeds

## S005: Remove pluginPath from RunnerConfig

**Intent**: Eliminate `pluginPath` from configuration surface — it's no longer user-configurable.

**Work**:
- Remove `readonly pluginPath: string` from `RunnerConfig` interface in `runner.ts`
- Update `PhaseRunner` constructor to resolve plugin path internally via `resolvePluginPath()`
- Update all `RunnerConfig` creation sites to omit `pluginPath`

**Done when**:
- `RunnerConfig` has no `pluginPath` field
- `PhaseRunner` resolves plugin path internally
- `npm run build` succeeds
- No type errors

## S006: Remove --plugin-path CLI flag

**Intent**: Remove CLI parsing, validation, and documentation for `--plugin-path`.

**Work**:
- Remove `pluginPath` field from `ParsedArgs` interface in `cli.ts`
- Remove `extractFlag(args, '--plugin-path')` call in `parseArgs()`
- Update usage string in `index.ts` to remove `--plugin-path <path>`
- Remove plugin path validation from `main()` in `index.ts`
- Update function call to `serve()` to not pass `pluginPath`

**Done when**:
- No references to `--plugin-path` in `cli.ts` or `index.ts`
- Usage string shows only `[--model <model>]` as optional flag
- `npm run build` succeeds

## S007: Implement post-run status check query

**Intent**: After main SDK query, verify phase completion status via `/phase-status latest`.

**Work**:
- Create `status-check.ts` module with `checkPhaseStatus()` function
- Function takes same dependencies as `PhaseRunner` (logger, config)
- Build lightweight SDK query: prompt="/phase-status latest", model=sonnet, maxTurns=5
- Use same plugin (Ushabti), same cwd, same hooks as main query
- Return phase status string extracted from query result
- Use discriminated union or Result type for return value

**Done when**:
- `status-check.ts` exists with `checkPhaseStatus()` function
- Function executes SDK query and returns phase status
- Follows style guide (5-line functions, dependency injection)
- `npm run build` succeeds

## S008: Parse and interpret phase status

**Intent**: Map phase status values to success/blocked outcomes.

**Work**:
- After main `runPhase()` completes, call `checkPhaseStatus()`
- If status is `complete`, `reviewing`, or `done`: treat as verified success
- If status is `building`, `planned`, or any other value: report as blocked
- Blocked reason: "phase loop incomplete — status: {actual status}"
- Log both SDK result and phase status for diagnostics
- Return appropriate `PhaseResult` based on combined outcomes

**Done when**:
- `runPhase()` calls status check after main query
- Success/blocked logic based on phase status implemented
- Diagnostic logs include both SDK outcome and phase status
- `npm run build` succeeds

## S009: Fix phaseStarted timestamp bug

**Intent**: Capture phase start time when phase begins, not during status write.

**Work**:
- In `runPhase()`, capture `phaseStarted` timestamp as ISO string at method entry
- Pass `phaseStarted` explicitly to `initializePhase()` instead of capturing inside
- Update `initializePhase()` signature to accept `phaseStarted: string` parameter
- Update `status.setBusy()` call to use provided timestamp

**Done when**:
- `phaseStarted` captured once at start of `runPhase()`
- Timestamp passed through to `setBusy()` call
- No timestamps generated inside `initializePhase()`
- `npm run build` succeeds

## S010: Create git operations module

**Intent**: Abstract git commands behind an injectable interface for testability.

**Work**:
- Create `git.ts` module with `GitOperations` class
- Define constructor taking `CommandExecutor` interface for running shell commands
- Implement methods: `isGitRepo()`, `isClean()`, `getCurrentBranch()`, `createBranch()`, `commit()`, `push()`, `openPR()`
- Each method returns Result type indicating success/failure
- Keep functions under 5 lines by extracting helpers
- Follow dependency injection and interface abstraction laws

**Done when**:
- `git.ts` exists with `GitOperations` class
- All git operations behind methods returning Result types
- `CommandExecutor` interface injected for testability
- `npm run build` succeeds

## S011: Integrate git pre-phase operations

**Intent**: Verify clean git state and create feature branch before phase execution.

**Work**:
- In `watcher.ts` or `runner.ts`, check if cwd is git repo before calling `runPhase()`
- If git repo: verify on main/master branch, working tree is clean, pull from remote
- Create feature branch `pharaoh/{phase-slug}` using phase name
- If any git check fails: log warning and skip git operations, but proceed with phase
- Pass `GitOperations` instance via dependency injection

**Done when**:
- Pre-phase git checks run before `runPhase()` in git repos
- Feature branch created with pattern `pharaoh/{phase-slug}`
- Failures logged as warnings, don't block phase execution
- Non-git directories skip git operations silently

## S012: Integrate git post-phase operations

**Intent**: Stage, commit, push, and open PR after green phase completion.

**Work**:
- After `runPhase()` returns success result, check if git operations are enabled
- Stage all changes with `git add -A`
- Commit with message: "Phase {phase-name} complete\n\nCo-Authored-By: Pharaoh <noreply@pharaoh>"
- Push branch to remote
- If `gh` CLI available: open PR with title "Phase {phase-name}" and generated body
- If `gh` unavailable: log info message with manual PR instructions
- Log all git operations for diagnostics

**Done when**:
- Post-phase git operations run after green phases
- Commits include all changes with descriptive message
- PR opened automatically if `gh` CLI available
- Failures logged but don't block phase result reporting

## S013: Update documentation

**Intent**: Reconcile documentation with CLI changes and new git integration.

**Work**:
- Update `.ushabti/docs/index.md` to remove all references to `--plugin-path`
- Document that Ushabti is now a dependency resolved automatically
- Add section on git integration: pre/post operations, branch naming, PR creation
- Update "How to Run" section to show simplified command: `pharaoh serve [--model <model>]`
- Note prerequisites: `npm install` must be run after cloning

**Done when**:
- Documentation mentions `npm install` as prerequisite
- No references to `--plugin-path` remain
- Git integration workflow documented
- `--model` shown as only CLI flag

## S014: Split runner.ts into smaller modules

**Intent**: Bring `runner.ts` under 100-line limit by extracting verification logic.

**Work**:
- Extract `verifyPhaseCompletion`, `logVerificationOutcome`, `interpretPhaseStatus`, `buildBlockedResult` to new `runner-verification.ts` module
- Import and call verification function from `runner.ts`
- Verify module is under 100 lines after extraction

**Done when**:
- `runner.ts` is 100 lines or fewer
- New `runner-verification.ts` module exists and is under 100 lines
- `npm run build` succeeds
- Tests still pass

## S015: Refactor DispatchWatcher constructor to use options object

**Intent**: Reduce `DispatchWatcher` constructor from 8 parameters to max 4.

**Work**:
- Define `DispatchWatcherOptions` interface with fields: `dispatchPath`, `pid`, `started`
- Update `DispatchWatcher` constructor signature to accept `(fs, logger, status, runner, git, options)`
- Update all `DispatchWatcher` instantiation sites to pass options object
- Verify parameter count is 6 (still above 4 but significantly better)

**Done when**:
- Constructor accepts options object for scalar parameters
- Parameter count reduced to 6 or fewer
- `npm run build` succeeds
- All instantiation sites updated

## S016: Further reduce DispatchWatcher constructor parameters

**Intent**: Bring constructor to max 4 parameters via composite dependency.

**Work**:
- Create `DispatchWatcherDeps` interface bundling `fs`, `logger`, `status`, `runner`, `git`
- Update constructor to accept `(deps, options)` — 2 parameters total
- Update instantiation in `server-deps.ts` to build deps object
- Verify parameter count is 2

**Done when**:
- Constructor has 2 parameters: `deps` and `options`
- All dependencies bundled in `DispatchWatcherDeps` interface
- `npm run build` succeeds
- `watcher.ts` is under 100 lines

## S017: Simplify updateState method

**Intent**: Reduce `updateState` method from 6 lines to 5 or fewer.

**Work**:
- Extract result message handling to separate helper function
- Inline simple message counter increment
- Reduce method to 5 lines total

**Done when**:
- `updateState` method has 5 or fewer body lines
- Logic preserved and correct
- `npm run build` succeeds
