# Phase 0012: Fix Lock Manager Instance Discarded During Server Startup

## Intent

Fix lock validation failures caused by discarding the lock manager instance that successfully acquired the lock during startup. Currently, `server.ts:acquireInstanceLock()` creates a `RealLockManager`, acquires the lock (setting `currentLock`), and then discards the instance. Later, `server-deps.ts:createLockManager()` creates a fresh `RealLockManager` with no `currentLock`, so all `validate()` calls return false and dispatch attempts fail with "Lock validation failed, aborting dispatch."

This phase fixes the issue by passing the acquired lock manager instance from `prepareServer` through `launchServer` and into `initializeDependencies`, eliminating the duplicate instantiation in `server-deps.ts`.

## Scope

**In scope:**
- Modify `prepareServer` to return the acquired lock manager instance
- Pass the lock manager from `serve` → `prepareServer` → `launchServer` → `initializeDependencies`
- Remove duplicate lock manager instantiation from `server-deps.ts:createLockManager()`
- Update `initializeDependencies` signature to accept lock manager as a parameter

**Out of scope:**
- Changing lock acquisition, validation, or release logic (it is correct)
- Modifying `RealLockManager`, `lock-validate.ts`, `lock-acquire.ts`, or `lock-release.ts`
- Changing test coverage or adding new tests (existing tests should continue to pass)

## Constraints

- **L06 (Dependency Injection)**: The lock manager must be injected, not instantiated within `initializeDependencies`
- **L04 (Explicit Return Types)**: All modified functions must maintain explicit return types
- **Sandi Metz (max 5 lines)**: Functions must stay under 5 lines; extract helpers if needed
- **No breaking changes**: Existing callers of `serve()` must work unchanged

## Acceptance Criteria

- `prepareServer` returns the acquired lock manager instance
- `launchServer` receives the lock manager and passes it to `initializeDependencies`
- `initializeDependencies` accepts the lock manager as a parameter instead of creating one
- `createLockManager` helper is removed from `server-deps.ts`
- All existing tests pass
- Lock validation succeeds during dispatch and phase execution (verified by successful dispatch file processing)

## Risks / Notes

- This is a straightforward refactor with minimal risk
- The existing lock logic is correct; this only fixes instance lifetime management
