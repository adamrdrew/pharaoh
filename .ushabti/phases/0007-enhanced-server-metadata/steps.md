# Steps

## S001: Add metadata fields to status type definitions

**Intent:** Extend the discriminated union types to include the six new metadata fields in appropriate status shapes.

**Work:**
- Add `pharaohVersion`, `ushabtiVersion`, `model`, `cwd`, `phasesCompleted` to `ServiceStatusIdle` interface
- Add all six fields (including `gitBranch`) to `ServiceStatusBusy` interface
- Add the five common fields (excluding `gitBranch`) to `ServiceStatusDone` and `ServiceStatusBlocked` interfaces
- Ensure `gitBranch` is only present in `ServiceStatusBusy`

**Done when:** All four status interfaces in `types.ts` include the appropriate new fields with proper types.

## S002: Extend status input types

**Intent:** Add metadata parameters to the input types used by status setter functions.

**Work:**
- Add `pharaohVersion`, `ushabtiVersion`, `model`, `cwd`, `phasesCompleted` to `SetIdleInput`
- Add all six fields (including `gitBranch`) to `SetBusyInput`
- Add five common fields to `SetDoneInput` and `SetBlockedInput`
- Use `readonly` modifiers on all new fields

**Done when:** All four input types in `status-inputs.ts` include the appropriate metadata fields.

## S003: Update status setter functions

**Intent:** Modify the builder functions to include new metadata in constructed status objects.

**Work:**
- Update `buildIdleStatus` to include five metadata fields from input
- Update `buildBusyStatus` to include all six metadata fields from input
- Update `buildDoneStatus` and `buildBlockedStatus` to include five metadata fields from input
- Ensure setters remain under 5 lines (extract helpers if needed)

**Done when:** All four setter functions in `status-setters.ts` include new fields in returned status objects.

## S004: Create version reader module

**Intent:** Provide a module that reads Pharaoh and Ushabti versions from package.json at startup.

**Work:**
- Create `version.ts` module with `readVersions()` function
- Read Pharaoh version from project's `package.json`
- Read Ushabti version from `node_modules/ushabti/package.json`
- Return typed object: `{ pharaohVersion: string; ushabtiVersion: string }`
- Use synchronous fs.readFileSync since this runs once at startup

**Done when:** `version.ts` exports a function that returns both versions as strings.

## S005: Add metadata to server initialization

**Intent:** Read versions and model at startup and pass them to dependencies that need them.

**Work:**
- Call `readVersions()` in `server.ts` during initialization
- Capture `cwd` from `process.cwd()`
- Pass versions, model, and cwd to `initializeDependencies` via config or new parameter
- Store in a metadata object that flows to watcher

**Done when:** Server startup reads versions once and holds them in memory for status writes.

## S006: Add phasesCompleted counter to DispatchWatcher

**Intent:** Track the number of completed phases in the watcher's state.

**Work:**
- Add `phasesCompleted` property to `DispatchWatcher` class, initialized to 0
- Increment counter when `reportPhaseComplete` is called with a successful result
- Pass current counter value to status setter calls via context

**Done when:** DispatchWatcher maintains an incrementing counter across multiple phase executions.

## S007: Capture git branch during phase execution

**Intent:** Include the active git branch in busy status during phase execution.

**Work:**
- Modify `prepareGitEnvironment` to return the created branch name (or null if git operations skipped)
- Pass branch name to runner's `runPhase` method
- Include branch in busy status writes during phase execution
- Omit branch from done/blocked writes after phase completes

**Done when:** Busy status includes `gitBranch` field with the feature branch name created during git pre-phase.

## S008: Thread metadata through all status writes

**Intent:** Ensure all status write calls include the new metadata fields.

**Work:**
- Update all `status.setIdle()` calls to include versions, model, cwd, phasesCompleted
- Update all `status.setBusy()` calls to include all six fields
- Update all `status.setDone()` and `status.setBlocked()` calls to include five fields (no gitBranch)
- Build metadata object at watcher level and pass through contexts

**Done when:** All status writes in watcher and runner include appropriate metadata fields.

## S009: Update tests for new status fields

**Intent:** Verify new fields are present and correct in all status writes.

**Work:**
- Update status writer tests to include new fields in assertions
- Update watcher tests to verify phasesCompleted increments
- Update runner tests to verify gitBranch is present in busy status
- Add test for multiple phase completions verifying counter increments
- Verify gitBranch is absent in idle/done/blocked statuses

**Done when:** All tests pass with new fields included in assertions and counter behavior verified.

## S010: Update documentation

**Intent:** Reconcile status schema documentation with new fields.

**Work:**
- Update `.ushabti/docs/index.md` "Status File Schema" section
- Add new fields to idle, busy, done, and blocked examples with realistic values
- Document that versions are read once at startup
- Document that phasesCompleted increments only on done transitions
- Document that gitBranch is only present during busy status

**Done when:** Documentation includes all six new fields in schema examples and explains their semantics.
