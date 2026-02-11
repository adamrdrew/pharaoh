# Review: Phase 0007 — Enhanced Server Metadata

## Summary (Second Review)

All acceptance criteria are now satisfied. Builder successfully fixed the counter increment timing defect and added comprehensive integration tests for the full status-write flow. All 117 tests pass.

## Verified

**Acceptance Criteria:**

1. All four status types include pharaohVersion, ushabtiVersion, model, cwd, phasesCompleted (AC #1)
   - Verified in types.ts lines 17-21 (Idle), 38-42 (Busy), 55-59 (Done), 72-76 (Blocked)

2. Busy status additionally includes gitBranch field (AC #2)
   - Verified in types.ts line 43, status-inputs.ts line 31
   - Test coverage in status-setters.test.ts lines 46-77

3. Idle, done, blocked statuses do NOT include gitBranch field (AC #3)
   - Verified in type definitions (no gitBranch property in these interfaces)
   - Explicit test coverage in status-setters.test.ts lines 30-42, 114-131, 170-188

4. Versions are read once at startup, not on every status write (AC #4)
   - Verified in server-deps.ts line 37: readVersions() called once
   - version.ts lines 23-28: synchronous read from package.json files
   - Versions passed through metadata to watcher and runner

5. phasesCompleted starts at 0 and increments only on done transitions (AC #5)
   - Verified in watcher.ts line 35: initialized to 0
   - watcher.ts line 90: increments when result.ok is true
   - watcher.ts line 92: passes updated counter value to reportPhaseComplete
   - watcher-helpers.ts line 37: reportPhaseComplete accepts updatedCounter parameter
   - watcher-helpers.ts lines 45, 50: uses updatedCounter for done/blocked writes
   - FIXED: Counter now increments before done status write, not after

6. gitBranch reflects feature branch name created during git pre-phase operations (AC #6)
   - Verified in git-pre-phase.ts lines 58-64: creates pharaoh/{slug} branch
   - Returns branch name (line 63) or null if not a git repo (line 12)
   - watcher.ts line 86: captures branch name
   - runner.ts lines 74-75, 103: includes in busy status writes

7. Tests verify all new fields are present in each status shape (AC #7)
   - status-setters.test.ts covers all four status types with field verification

8. Tests verify phasesCompleted increments across multiple phase completions (AC #8)
   - watcher-helpers.test.ts lines 113-144: sequential completions 0→1→2→3
   - watcher-helpers.test.ts lines 85-111: explicit pre/post-increment test (5→6)
   - watcher-helpers.test.ts lines 57-83: first completion 0→1
   - watcher-helpers.test.ts lines 146-171: blocked phases don't increment

9. Tests verify gitBranch is only present during busy status (AC #9)
   - status-setters.test.ts lines 30-42 (idle), 114-131 (done), 170-188 (blocked) all verify gitBranch absent
   - lines 46-77 verify gitBranch present in busy

10. Documentation updated with new schema and examples (AC #10)
    - .ushabti/docs/index.md lines 121-127: metadata fields documented
    - Lines 133-143: idle example with 5 fields
    - Lines 150-165: busy example with 6 fields including gitBranch
    - Lines 179-194: done example with 5 fields, counter incremented
    - Lines 201-217: blocked example with 5 fields
    - Semantic notes at lines 127, 148, 177, 199

**Law Compliance:**

- **L02, L03, L04 (Type Safety):** All new fields properly typed, no any types, explicit return types on all functions
- **L05 (Single Responsibility):** StatusManager focused on writes, version reading at startup, counter in DispatchWatcher
- **L06, L07 (Dependency Injection):** Versions passed through DI, no direct file reads in status module, filesystem behind interface
- **L08 (Unit Tests):** All tests use FakeFilesystem and FakeLogger, no real I/O
- **L09 (Test Coverage):** All conditional paths covered, including counter increment, blocked phases, missing git
- **L10 (Deterministic Tests):** All tests are deterministic and independent
- **L15, L17 (Documentation Reconciliation):** Docs fully updated with new schema, examples, and semantics

**Sandi Metz Rules:**

- All modules under 100 lines
- All functions under 5 lines (status setters use spread operator)
- Options objects used for >4 parameters
- Dependencies injected via constructor

## Issues

None. Both previously identified defects have been resolved:

1. Counter increment timing: Fixed by incrementing before calling reportPhaseComplete and passing updated value as parameter
2. Missing integration tests: Added four comprehensive tests in watcher-helpers.test.ts verifying full flow

## Required Follow-ups

None.

## Decision

Phase 0007 is COMPLETE. All acceptance criteria verified, all laws satisfied, all tests passing (117/117), documentation reconciled. The enhanced server metadata feature is ready for use.

Weighed and found true.
