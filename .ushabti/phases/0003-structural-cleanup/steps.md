# Implementation Steps

## S001: Add appendFile to Filesystem interface

**Intent**: Extend the Filesystem interface with an append-only write operation to support the logger refactor.

**Work**:
- Add `appendFile(path: string, content: string): Promise<void>` to the `Filesystem` interface in `status.ts`
- Implement in `RealFilesystem` using Node's `fs.appendFile`
- Update all test fakes to include the new method (stub or no-op is acceptable)

**Done when**:
- TypeScript compiles with no errors
- `Filesystem` interface declares `appendFile`
- `RealFilesystem` implements `appendFile` using `fs.appendFile`

---

## S002: Add mkdir to Filesystem interface

**Intent**: Extend the Filesystem interface to support directory creation for startup initialization.

**Work**:
- Add `mkdir(path: string, options?: { recursive: boolean }): Promise<void>` to the `Filesystem` interface in `status.ts`
- Implement in `RealFilesystem` using Node's `fs.mkdir`
- Update all test fakes to include the new method (stub or no-op is acceptable)

**Done when**:
- TypeScript compiles with no errors
- `Filesystem` interface declares `mkdir`
- `RealFilesystem` implements `mkdir` using `fs.mkdir`

---

## S003: Refactor Logger to use append-only writes

**Intent**: Fix the logger's O(n²) scaling bug by replacing read-modify-write with append-only writes.

**Work**:
- Replace the `write()` method's read-then-write pattern with a direct call to `this.fs.appendFile()`
- Remove the `exists()` check—`appendFile` creates the file if it doesn't exist
- Verify the method is now 5 lines or fewer

**Done when**:
- Logger's `write()` method uses `appendFile` instead of `readFile` + `writeFile`
- Logger never calls `readFile` on the log path during normal operation
- TypeScript compiles with no errors

---

## S004: Define StatusManager input interfaces

**Intent**: Replace long parameter lists with typed objects to satisfy Sandi Metz 4-parameter rule.

**Work**:
- Define interfaces in `status.ts`:
  - `SetIdleInput { pid: number; started: string }`
  - `SetBusyInput { pid: number; started: string; phase: string; phaseStarted: string }`
  - `SetDoneInput { pid: number; started: string; phase: string; phaseStarted: string; phaseCompleted: string; costUsd: number; turns: number }`
  - `SetBlockedInput { pid: number; started: string; phase: string; phaseStarted: string; phaseCompleted: string; error: string; costUsd: number; turns: number }`
- All interfaces should use `readonly` properties

**Done when**:
- Four interfaces are defined and exported from `status.ts`
- TypeScript compiles with no errors

---

## S005: Refactor StatusManager method signatures

**Intent**: Update StatusManager methods to accept typed objects instead of positional parameters.

**Work**:
- Change `setIdle(input: SetIdleInput): Promise<void>`
- Change `setBusy(input: SetBusyInput): Promise<void>`
- Change `setDone(input: SetDoneInput): Promise<void>`
- Change `setBlocked(input: SetBlockedInput): Promise<void>`
- Update method bodies to destructure from `input`

**Done when**:
- All four methods accept a single typed object
- TypeScript compiles with no errors
- All methods have explicit return types

---

## S006: Update StatusManager call sites

**Intent**: Fix all call sites to use the new StatusManager API.

**Work**:
- Update `index.ts` line 112: `await status.setIdle({ pid, started })`
- Update `watcher.ts` line 110, 124, 175: `await this.status.setIdle({ pid: this.pid, started: this.started })`
- Update `watcher.ts` line 147-155: pass object to `setDone`
- Update `watcher.ts` line 158-167: pass object to `setBlocked`
- Update `runner.ts` line 41: pass object to `setBusy`

**Done when**:
- All StatusManager method calls use object syntax
- TypeScript compiles with no errors
- `npm run build` succeeds

---

## S007: Update path constants to .pharaoh

**Intent**: Change all Pharaoh state file paths from `.ushabti/` to `.pharaoh/`.

**Work**:
- Update `index.ts` line 53: `const dispatchPath = path.join(cwd, '.pharaoh', 'dispatch')`
- Update `index.ts` line 54: `const statusPath = path.join(cwd, '.pharaoh', 'pharaoh.json')`
- Update `index.ts` line 55: `const logPath = path.join(cwd, '.pharaoh', 'pharaoh.log')`
- Do NOT change line 56 (plugin path—that's Ushabti's directory)

**Done when**:
- All three path definitions reference `.pharaoh/`
- File names are `pharaoh.json` and `pharaoh.log`
- TypeScript compiles with no errors

---

## S008: Add startup directory creation

**Intent**: Ensure `.pharaoh/` and `.pharaoh/dispatch/` exist before the server starts.

**Work**:
- In `index.ts` `serve()`, before creating the logger/status/watcher, add:
  - `await fs.mkdir(path.join(cwd, '.pharaoh'), { recursive: true })`
  - `await fs.mkdir(dispatchPath, { recursive: true })`

**Done when**:
- Startup creates `.pharaoh/` if it doesn't exist
- Startup creates `.pharaoh/dispatch/` if it doesn't exist
- TypeScript compiles with no errors

---

## S009: Add CLI argument parsing

**Intent**: Replace hardcoded plugin path and model with CLI arguments.

**Work**:
- Update `parseArgs()` to accept optional `--plugin-path` and `--model` flags
- Return `{ command: string; pluginPath?: string; model?: string }`
- In `main()`, if `command === 'serve'` but `pluginPath` is missing, print usage and exit
- Pass `pluginPath` and `model` (with default) to `serve()`

**Done when**:
- `parseArgs()` extracts `--plugin-path` and `--model` from argv
- `serve()` accepts `pluginPath: string, model?: string` parameters
- `pharaoh serve` without `--plugin-path` shows usage and exits with code 1
- TypeScript compiles with no errors

---

## S010: Add plugin path validation

**Intent**: Ensure the provided plugin path exists before starting the server.

**Work**:
- In `serve()`, after parsing args, check `await fs.exists(pluginPath)`
- If false, log error and exit with code 1

**Done when**:
- Invalid plugin paths are rejected at startup
- Error message is clear
- TypeScript compiles with no errors

---

## S011: Remove or improve assistant message logging

**Intent**: Eliminate log spam from identical "Assistant message received" entries.

**Work**:
- Option 1: Remove lines 146-150 from `runner.ts` entirely
- Option 2: Add a turn counter and log `{ phase: name, turn: turnNumber }` instead
- Choose the option that provides the most value for observability

**Done when**:
- Log output no longer contains hundreds of identical "Assistant message received" entries
- TypeScript compiles with no errors

---

## S012: Add turns and maxTurns to completion log

**Intent**: Improve observability by showing turns used relative to the limit.

**Work**:
- Update `runner.ts` line 98 to include `maxTurns: 200` in the log context
- The log should now show: `{ phase, turns, maxTurns: 200, costUsd, durationMs }`

**Done when**:
- Phase completion log includes both `turns` and `maxTurns`
- TypeScript compiles with no errors

---

## S013: Update documentation

**Intent**: Reconcile `.ushabti/docs/index.md` with the new file layout and paths (required by L15, L17).

**Work**:
- Replace all references to `service.json` with `pharaoh.json`
- Replace all references to `service.log` with `pharaoh.log`
- Replace all references to `.ushabti/dispatch` with `.pharaoh/dispatch`
- Update "How to Run" section to document `--plugin-path` requirement
- Update "Status File Schema" section header to reference `pharaoh.json`
- Update "Service Log" section header to "Pharaoh Log" and reference `pharaoh.log`

**Done when**:
- No stale references to old file names remain
- CLI argument requirements are documented
- Documentation accurately reflects the new file layout

---

## S014: Verify no .ushabti references remain

**Intent**: Ensure Pharaoh no longer writes to or depends on `.ushabti/` for its own state.

**Work**:
- Run `grep -r "\.ushabti" src/` and verify only plugin path references remain
- Check that `.ushabti/dispatch`, `service.json`, `service.log` are gone from source

**Done when**:
- Grep for `.ushabti` in `src/` returns zero hits except for plugin path references
- No hardcoded machine-specific paths remain in source

---

## S015: Split oversized modules

**Intent**: Satisfy Sandi Metz 100-line module limit by extracting functionality into separate modules.

**Work**:
- Extract CLI argument parsing from index.ts into new cli.ts module
- Extract signal handling and shutdown logic from index.ts into new shutdown.ts module
- Extract type guards and validation from status.ts into new validation.ts module
- Consider splitting runner.ts if message handling can be extracted

**Done when**:
- All src/ modules are 100 lines or fewer
- TypeScript compiles with no errors
- All tests pass

---

## S016: Refactor long functions

**Intent**: Satisfy Sandi Metz 5-line function limit by extracting helper functions.

**Work**:
- Refactor parseArgs() to use helper functions for argument extraction
- Refactor serve() to use helper functions for initialization, signal setup, and startup sequence
- Review and refactor any other functions exceeding 5 lines in runner.ts, watcher.ts, status.ts

**Done when**:
- All functions are 5 lines or fewer
- TypeScript compiles with no errors
- All tests pass
- Function names clearly describe extracted operations

---

## S017: Complete function line count compliance

**Intent**: Complete S016 requirement by refactoring remaining oversized functions to satisfy Sandi Metz 5-line limit.

**Work**:
- Refactor server.ts: serve(), buildPaths(), initializeDependencies(), startServer()
- Refactor runner.ts: processQueryMessages(), handleMessage()
- Refactor watcher.ts: handleDispatchFile(), processQueue(), processDispatchFile(), buildContext()
- Refactor watcher-helpers.ts: checkFileExists(), parseAndValidate(), reportPhaseComplete()
- Refactor runner-results.ts: buildSuccessResult(), buildFailureResult(), buildNoResultError()
- Refactor runner-query.ts: buildQueryOptions(), createBlockHook()
- Refactor log.ts: formatTimestamp(), write()

**Done when**:
- All functions in src/ are 5 lines or fewer
- TypeScript compiles with no errors
- All tests pass
- Function names clearly describe extracted operations
