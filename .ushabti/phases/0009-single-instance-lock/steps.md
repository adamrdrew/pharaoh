# Steps

## S001: Define lock types and results

**Intent:** Establish discriminated unions for lock states and typed results for lock operations.

**Work:**
- Create `src/lock-types.ts`
- Define `LockState` discriminated union: `acquired`, `held-by-other`, `stale`
- Define `LockInfo` interface: `pid`, `started`, `instanceId`
- Define `LockResult` type: `Result<LockInfo, LockError>`
- Define `LockError` class with context (operation, reason, existing lock info)

**Done when:** Types compile and export correctly. No implementation yet.

## S002: Create LockManager interface and implementation

**Intent:** Abstract lock acquisition, validation, and release behind an injectable interface.

**Work:**
- Create `src/lock-manager.ts`
- Define `LockManager` interface: `acquire()`, `validate()`, `release()`
- Implement `RealLockManager` using Node.js `fs` primitives (PID-based locking)
- `acquire()`: write lock file with PID, start time, instance ID; return `LockResult`
- `validate()`: check lock file matches current process; return boolean
- `release()`: delete lock file if owned

**Done when:** Interface and implementation compile. No tests yet.

## S003: Extend Filesystem interface for lock file operations

**Intent:** Add lock file read/write to `Filesystem` to support testing.

**Work:**
- Extend `Filesystem` interface in `src/status.ts` with `open()` method for exclusive file creation
- Update `RealFilesystem` in `src/filesystem.ts` to implement `open()`
- Refactor `RealLockManager` to use `Filesystem` dependency instead of raw `fs`

**Done when:** `Filesystem` interface extended, `RealFilesystem` updated, `RealLockManager` uses injected `Filesystem`.

## S004: Integrate lock acquisition into server startup

**Intent:** Acquire lock during server initialization and fail fast if locked.

**Work:**
- Update `src/server.ts` to instantiate `LockManager` in `prepareServer()`
- Call `lockManager.acquire()` before starting watcher
- If `acquire()` returns `held-by-other`, log error with PID/start time and exit process
- If `acquire()` returns `stale`, log warning and proceed
- Store `LockManager` instance in `ServerDependencies` for injection

**Done when:** Server startup acquires lock and exits cleanly on conflict. Startup logs lock info.

## S005: Add pre-dispatch lock validation in watcher

**Intent:** Validate lock ownership before processing every dispatch file.

**Work:**
- Inject `LockManager` into `DispatchWatcher` constructor
- In `processDispatchFile()`, call `lockManager.validate()` before parsing the file
- If validation fails, log error, skip dispatch, and transition back to idle
- Ensure validation happens unconditionally in the dispatch code path

**Done when:** `DispatchWatcher` validates lock before dispatch. Failed validation aborts dispatch and logs error.

## S006: Add periodic lock validation during phase execution

**Intent:** Validate lock ownership during phase execution to detect stolen locks.

**Work:**
- Inject `LockManager` into `PhaseRunner` constructor
- In `processMessage()`, call `lockManager.validate()` every N turns (e.g., 10 turns)
- If validation fails, abort current phase and return `blocked` result with lock error
- Log lock validation failures with phase context

**Done when:** `PhaseRunner` validates lock periodically. Failed validation aborts phase.

## S007: Add lock release to shutdown handler

**Intent:** Release lock file on clean shutdown.

**Work:**
- Update `src/shutdown.ts` to call `lockManager.release()` during shutdown
- Ensure lock is released before removing `pharaoh.json`
- Log lock release event

**Done when:** Shutdown handler releases lock. SIGTERM/SIGINT remove lock file.

## S008: Implement fake lock manager for testing

**Intent:** Create test double for `LockManager` to enable unit testing without real filesystem.

**Work:**
- Create `tests/fakes/fake-lock-manager.ts`
- Implement `FakeLockManager` with in-memory state simulation
- Support scenarios: lock held, lock stale, lock stolen during execution
- Export helper functions for test setup (e.g., `createHeldLock()`, `createStaleLock()`)

**Done when:** `FakeLockManager` compiles and exports. No tests yet.

## S009: Test lock acquisition and conflict detection

**Intent:** Verify lock acquisition, stale detection, and conflict handling.

**Work:**
- Create `tests/lock-manager.test.ts`
- Test: `acquire()` succeeds when no lock exists
- Test: `acquire()` returns `held-by-other` when lock held by live process
- Test: `acquire()` overwrites stale lock (PID not running)
- Test: `validate()` returns true when lock owned
- Test: `validate()` returns false when lock file deleted or modified
- Test: `release()` removes lock file

**Done when:** All `LockManager` conditional paths covered. Tests pass.

## S010: Test server startup lock integration

**Intent:** Verify server startup acquires lock and fails on conflict.

**Work:**
- Update `tests/server.test.ts` (or create if missing)
- Test: Server startup acquires lock and creates lock file
- Test: Second server startup fails when lock held
- Test: Server startup succeeds after stale lock detected
- Use `FakeLockManager` in tests

**Done when:** Server startup lock behavior covered. Tests pass.

## S011: Test watcher pre-dispatch validation

**Intent:** Verify watcher validates lock before every dispatch.

**Work:**
- Update `tests/watcher.test.ts`
- Test: Dispatch proceeds when lock valid
- Test: Dispatch aborted when lock validation fails
- Test: Lock validation called before parsing dispatch file
- Use `FakeLockManager` to simulate lock theft

**Done when:** Watcher lock validation covered. Tests pass.

## S012: Test runner periodic validation

**Intent:** Verify runner validates lock during execution and aborts on failure.

**Work:**
- Update `tests/runner.test.ts`
- Test: Phase execution proceeds when lock valid
- Test: Phase execution aborted when lock validation fails mid-execution
- Test: Lock validation called periodically (every N turns)
- Use `FakeLockManager` to simulate lock theft during execution

**Done when:** Runner lock validation covered. Tests pass.

## S013: Test shutdown lock release

**Intent:** Verify shutdown handler releases lock.

**Work:**
- Update `tests/shutdown.test.ts` (or create if missing)
- Test: Shutdown releases lock file
- Test: Lock released before `pharaoh.json` removed
- Use `FakeLockManager` to verify `release()` called

**Done when:** Shutdown lock release covered. Tests pass.

## S014: Update documentation

**Intent:** Document lock behavior in project docs.

**Work:**
- Update `.ushabti/docs/index.md` with new "Lock File" section
- Document lock file location, format, and behavior
- Describe startup conflict error message
- Document stale lock detection and manual recovery process
- Update architecture section with `LockManager` module

**Done when:** Documentation includes lock file behavior. No stale references to old unlocked behavior.

## S015: Decompose lock-manager.ts to comply with 100-line limit

**Intent:** Split the 208-line `lock-manager.ts` module into smaller modules following the existing codebase pattern (e.g., `runner-*.ts`, `status-*.ts`, `watcher-*.ts`).

**Work:**
- Extract lock acquisition logic to `lock-acquire.ts` (functions: `acquireLock`, `handleAcquireFailure`, `overwriteStaleLock`, `buildHeldResult`)
- Extract lock validation logic to `lock-validate.ts` (functions: `validateLock`, `matchesCurrentLock`)
- Extract lock release logic to `lock-release.ts` (function: `releaseLock`)
- Extract lock file I/O primitives to `lock-io.ts` (functions: `writeLockFileExclusive`, `writeLockFile`, `buildLockInfo`)
- Extract PID checking to `lock-pid.ts` (class: `RealPidChecker`, function: `isProcessRunning`)
- Refactor `lock-manager.ts` to be the main module exporting `LockManager` interface and `RealLockManager` class that imports and composes the extracted functions
- Update all imports in test files and production code
- Verify `npm run typecheck` passes
- Verify `npm test` passes (all 151 tests)

**Done when:** All lock-related modules are under 100 lines. No module exceeds the Sandi Metz 100-line limit. Typecheck and all tests pass. No functional changes to lock behavior.
