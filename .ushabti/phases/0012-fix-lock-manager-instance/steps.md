# Steps

## S001: Modify prepareServer to return lock manager

**Intent:** Change `prepareServer` to return the acquired lock manager instance so it can be passed to later initialization stages.

**Work:**
- Change `acquireInstanceLock` to return the `RealLockManager` instance after successful acquisition
- Update `prepareServer` return type to `Promise<LockManager>`
- Return the lock manager from `prepareServer`

**Done when:** `prepareServer` returns the lock manager instance and compiles without errors.

## S002: Thread lock manager through to initializeDependencies

**Intent:** Pass the lock manager from `serve` through `launchServer` and into `initializeDependencies` as a parameter.

**Work:**
- Update `serve` to capture the lock manager from `prepareServer` and pass it to `launchServer`
- Add `lock: LockManager` parameter to `launchServer` signature
- Pass the lock manager from `launchServer` to `initializeDependencies`
- Add `lock: LockManager` parameter to `initializeDependencies` signature

**Done when:** The lock manager flows from `prepareServer` → `serve` → `launchServer` → `initializeDependencies` and compiles without errors.

## S003: Remove duplicate lock manager instantiation

**Intent:** Remove the `createLockManager` helper that creates a duplicate instance with no `currentLock`.

**Work:**
- Remove the `createLockManager` function from `server-deps.ts`
- Update `initializeDependencies` to use the injected `lock` parameter instead of calling `createLockManager`
- Ensure `initializeDependencies` passes the injected lock to `createDispatchWatcher`

**Done when:** `createLockManager` is deleted, `initializeDependencies` uses the injected lock, and the module compiles without errors.

## S004: Verify tests pass

**Intent:** Confirm all existing tests pass after the refactor.

**Work:**
- Run `npm test`
- Verify all tests pass

**Done when:** Test suite is green.
