# Review: Phase 0009 — Single-Instance Lock

## Summary

Phase 0009 implements single-instance lock enforcement to prevent concurrent Pharaoh instances from corrupting shared project state. The implementation includes OS-level lock acquisition on startup, pre-dispatch validation, periodic validation during phase execution, stale lock detection, and clean shutdown with lock release.

**Re-review status**: The critical defect found in the initial review has been resolved. The `lock-manager.ts` module has been successfully decomposed into 6 modules, all under the 100-line limit. All tests pass and typecheck passes. The Phase is now complete.

## Verified

### Law Compliance
- **L02 (No Any)**: No `any` types found in lock implementation
- **L03 (No Type Assertions)**: No unsafe type assertions. The one `as` cast in `lock-manager.ts` line 111 is validating JSON parsing from a known lock file format (acceptable at system boundary)
- **L04 (Explicit Return Types)**: All public functions have explicit return types
- **L06 (Dependency Injection)**: Lock manager is properly injected into `DispatchWatcher`, `PhaseRunner`, and server startup
- **L07 (Side Effects Behind Interfaces)**: Lock operations abstract filesystem and PID checking behind injectable interfaces (`Filesystem`, `PidChecker`)
- **L08 (Tests Don't Touch Real Systems)**: All tests use `FakeFilesystem` and `FakeLockManager` or `FakePidChecker`
- **L09 (All Conditional Paths Tested)**: Tests cover lock acquisition success, conflict, stale detection, validation success/failure, and release

### Style Compliance
- **Discriminated unions**: `LockState` correctly uses discriminated union with `state` tag
- **Typed results**: `LockResult` follows the typed result pattern
- **Kebab-case filenames**: All new files follow convention (`lock-types.ts`, `lock-manager.ts`, `lock-acquire.ts`, `lock-validate.ts`, `lock-release.ts`, `lock-io.ts`, `lock-pid.ts`)
- **Const/readonly defaults**: Lock types use `readonly` correctly
- **Function line counts**: Individual functions comply with 5-line limit
- **Sandi Metz module limit**: **COMPLIANT** — All lock modules under 100 lines:
  - `lock-manager.ts`: 60 lines
  - `lock-acquire.ts`: 75 lines
  - `lock-validate.ts`: 24 lines
  - `lock-release.ts`: 20 lines
  - `lock-io.ts`: 35 lines
  - `lock-pid.ts`: 26 lines

### Implementation Verification

**S001 (Lock types)**: Types defined correctly with discriminated unions, typed results, and context-rich `LockError` class.

**S002 (LockManager interface)**: Interface defined with `acquire()`, `validate()`, `release()`. `RealLockManager` implements PID-based locking using injected `Filesystem` and `PidChecker`.

**S003 (Filesystem extension)**: `Filesystem` interface extended with `openExclusive()` method. `RealFilesystem` implements using `fs.open` with `wx` flag. `RealLockManager` properly uses injected `Filesystem`.

**S004 (Server startup integration)**: Lock acquisition integrated in `server.ts` `prepareServer()` function. Fails fast with clear error message on conflict. Lock manager stored in server dependencies.

**S005 (Pre-dispatch validation)**: `DispatchWatcher` validates lock ownership before processing every dispatch file. Failed validation aborts dispatch and logs error.

**S006 (Periodic validation during execution)**: `PhaseRunner` validates lock every 10 turns. Failed validation aborts phase and returns blocked result with "Lock stolen during execution" error.

**S007 (Shutdown lock release)**: Shutdown handler releases lock before removing `pharaoh.json`. Lock release logged.

**S008 (Fake lock manager)**: `FakeLockManager` implemented with in-memory state, `simulateLockStolen()` helper, and test helpers `createHeldLock()`, `createStaleLock()`.

**S009-S013 (Tests)**: All test scenarios covered:
- Lock acquisition, conflict, stale detection, validation, release
- Server startup lock integration
- Watcher pre-dispatch validation abort on failure
- Runner periodic validation and abort on failure
- Shutdown lock release and ordering

**S014 (Documentation)**: `.ushabti/docs/index.md` updated with comprehensive lock file documentation including location, format, acquisition, validation, release, stale recovery, and manual recovery procedures.

**S015 (Decompose lock-manager.ts)**: Successfully decomposed `lock-manager.ts` from 208 lines to 60 lines by extracting:
- `lock-acquire.ts` (75 lines): Lock acquisition logic with `acquireLock`, `handleAcquireFailure`, `buildHeldResult`, `overwriteStaleLock`
- `lock-validate.ts` (24 lines): Lock validation logic with `validateLock`, `matchesCurrentLock`
- `lock-release.ts` (20 lines): Lock release logic with `releaseLock`
- `lock-io.ts` (35 lines): Lock file I/O primitives with `writeLockFileExclusive`, `writeLockFile`, `buildLockInfo`
- `lock-pid.ts` (26 lines): PID checking with `PidChecker` interface, `RealPidChecker` class, `isProcessRunning`

The main `lock-manager.ts` now serves as the composition layer exporting `LockManager` interface, `RealLockManager` class, and re-exporting `PidChecker` and `RealPidChecker` for convenience. All imports in production code and tests continue to use `lock-manager.ts` as the entry point. The decomposition is purely structural with no functional changes.

### Typecheck and Tests
- **Typecheck**: Passes with no errors (`npm run typecheck`)
- **Tests**: All 151 tests pass (`npm test`)

### Acceptance Criteria

1. **Startup lock acquisition**: Implemented. Server acquires `.pharaoh/pharaoh.lock` on startup. Conflict with live process exits with clear error message.
2. **Pre-dispatch validation**: Implemented. Watcher validates lock ownership before processing every dispatch file. Validation is unconditional and mechanical (no model involvement).
3. **During-execution validation**: Implemented. Runner validates lock ownership every 10 turns. Failed validation aborts phase immediately.
4. **Stale lock detection**: Implemented. Lock acquisition overwrites stale locks (PID not running) and logs warning with old PID and start time.
5. **Clean shutdown**: Implemented. SIGTERM/SIGINT handlers release lock before exiting.
6. **Mechanical enforcement**: Verified. All lock validation is in TypeScript application code (server startup, watcher dispatch loop, runner message processing). No reliance on model instructions.
7. **Two instances cannot proceed**: Verified. Second instance attempting lock acquisition returns `held-by-other` error and exits with code 1.
8. **Tests cover all scenarios**: Verified. Tests cover acquisition, conflict, stale detection, validation failure, and release.

## Issues

None. The initial review found a critical defect (module size violation), which has been resolved in S015.

## Re-Review Verification

After kick-back, Builder implemented S015 to decompose `lock-manager.ts`. Verified:

1. **Module decomposition is clean**: All 6 lock modules are well under 100 lines with clear separation of concerns
2. **No functional changes**: The decomposition is purely structural - all logic moved unchanged to new modules
3. **Backward compatibility maintained**: All imports still reference `lock-manager.ts` as the main entry point
4. **Tests still pass**: All 151 tests pass (verified with `npm test`)
5. **Typecheck passes**: No type errors (verified with `npm run typecheck`)
6. **Integration points intact**: Verified that `server.ts`, `runner.ts`, `watcher.ts`, `shutdown.ts`, and all test files continue to import from `lock-manager.ts` successfully

The decomposition follows the existing codebase pattern (e.g., `runner-*.ts`, `status-*.ts`, `watcher-*.ts`) and preserves all acceptance criteria from the initial review.

## Decision

Phase is **COMPLETE**. All acceptance criteria met, all laws and style rules satisfied, documentation reconciled, and all tests pass. The lock implementation mechanically prevents concurrent Pharaoh instances and has been correctly decomposed to comply with the Sandi Metz 100-line module limit.

This Phase is weighed and found true.
