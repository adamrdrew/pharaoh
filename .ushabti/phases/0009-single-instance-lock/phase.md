# Phase 0009: Single-Instance Lock

## Intent

Mechanically prevent concurrent Pharaoh instances from corrupting shared project state through exclusive file locking. Multiple Pharaoh processes targeting the same directory create data races on git operations, `.ushabti/phases/` state, `pharaoh.json`, and source files. This phase adds OS-level locking to make concurrent execution impossible.

## Scope

**In scope:**
- OS-level exclusive lock acquisition on startup (via Node.js `fs.open` with `wx` flag or platform-specific file locking)
- Lock validation before every dispatch (unconditional check in `watcher.ts` dispatch path)
- Periodic lock validation during phase execution (check in `runner.ts` message processing loop)
- Stale lock detection via PID liveness check
- Lock release on clean shutdown (SIGTERM, SIGINT)
- Lock file format: JSON with PID, start time, instance ID
- Tests using fake filesystem with lock simulation

**Out of scope:**
- Lock recovery UI or automated stale lock cleanup (manual intervention required)
- Distributed locks for networked filesystems (assumes local filesystem)
- Lock file rotation or historical lock tracking
- Lock inheritance across child processes

## Constraints

This Phase is constrained by the following laws and style conventions:

### Laws
- **L06**: All dependencies must be injected. Lock manager must be a dependency of `DispatchWatcher`, `PhaseRunner`, and the server startup sequence.
- **L07**: File operations must be behind injectable interfaces. Lock operations should abstract OS-level primitives to enable testing.
- **L08**: Unit tests must not touch real filesystem. Lock tests must use fakes.
- **L09**: All conditional paths must be tested (lock held, stale, released, stolen).

### Style
- **Discriminated unions**: Lock states (`acquired`, `held-by-other`, `stale`) as discriminated unions
- **Typed results**: Lock acquisition returns `Result<Lock, LockError>`, not exceptions
- **Sandi Metz rules**: Max 100 lines per module, max 5 lines per function, max 4 parameters
- **Kebab-case filenames**: `lock-manager.ts`, `lock-types.ts`, etc.
- **Dependency injection**: Lock manager injected into watcher and runner

## Acceptance Criteria

1. **Startup lock acquisition**: When Pharaoh starts, it attempts to acquire `.pharaoh/pharaoh.lock`. If the lock is held by a live process (PID still running), startup fails with a clear error message including the PID and start time of the lock holder.

2. **Pre-dispatch validation**: Before processing any dispatch file in `watcher.ts`, Pharaoh validates it still holds the lock. If validation fails, the dispatch is aborted and an error is logged. This check is unconditional and happens in application code, not via prompts.

3. **During-execution validation**: During phase execution in `runner.ts`, Pharaoh periodically validates lock ownership (e.g., every 10 turns or every 30 seconds). If the lock is stolen or released, the current phase execution is aborted immediately.

4. **Stale lock detection**: If Pharaoh finds an existing lock file but the PID is not running, it treats the lock as stale and overwrites it. The old PID and start time are logged as a warning.

5. **Clean shutdown**: When Pharaoh receives SIGTERM or SIGINT, it releases the lock file before exiting. The shutdown handler removes `.pharaoh/pharaoh.lock`.

6. **Mechanical enforcement**: All lock validation is implemented in TypeScript application code (server startup, watcher dispatch loop, runner message processing). No reliance on model instructions or prompts.

7. **Two instances cannot proceed**: Running `npx @adamrdrew/pharaoh serve` twice in the same directory results in the second instance refusing to start with a clear lock conflict error.

8. **Tests cover all scenarios**: Unit tests (using fake filesystem) cover lock acquisition, lock conflict, stale lock detection, lock validation failure, and lock release on shutdown.

## Risks / Notes

- **OS-level locking nuances**: Node.js `fs.open` with `wx` flag creates an exclusive file but doesn't prevent deletion. We rely on PID liveness checks to detect stale locks. Alternative: platform-specific advisory locks via `flock` (Linux/macOS) or `LockFileEx` (Windows) via native bindings, but this adds complexity. Decision: start with PID-based detection; revisit if needed.

- **PID reuse**: On some systems, PIDs can be reused quickly. Lock files include start time to reduce false positives. If a stale lock's PID is reused by an unrelated process, we log a warning and proceed (acceptable risk; manual intervention available).

- **Lock file deletion**: If an external process deletes `.pharaoh/pharaoh.lock`, Pharaoh's in-memory lock state becomes invalid. Periodic validation during execution catches this scenario and aborts the phase.

- **Filesystem interface limitation**: OS-level file locking (e.g., `flock`) is not currently exposed by the `Filesystem` interface. This phase extends the interface or adds a separate `LockManager` abstraction that uses Node.js primitives directly. Tests use a fake lock manager.
