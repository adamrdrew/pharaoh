# Steps

## S001: Update type definitions for prUrl and gitBranch

**Intent:** Add optional `prUrl` and `gitBranch` fields to status types to support new observability features.

**Work:**
- Add `readonly prUrl?: string` to `ServiceStatusDone` and `ServiceStatusBlocked` in `types.ts`
- Add `readonly gitBranch?: string` to `ServiceStatusIdle`, `ServiceStatusDone`, and `ServiceStatusBlocked` in `types.ts`
- Update `status-inputs.ts` to include optional `prUrl?: string` in `SetDoneInput` and `SetBlockedInput`
- Update `status-inputs.ts` to include optional `gitBranch?: string` in `SetIdleInput`, `SetDoneInput`, and `SetBlockedInput`

**Done when:** TypeScript compiler accepts updated types and all downstream code still compiles.

## S002: Modify GitOperations to return PR URL

**Intent:** Extract PR URL from `gh pr create` output and return it to callers.

**Work:**
- Change `GitOperations.openPR()` return type from `GitResult<void>` to `GitResult<string>`
- Parse stdout from `gh pr create` to extract the PR URL (typically the last line)
- Return the extracted URL in the success case

**Done when:** `GitOperations.openPR()` returns `{ ok: true; value: 'https://github.com/...' }` on success.

## S003: Create PR description builder module

**Intent:** Generate rich prose PR descriptions by reading phase documentation from the filesystem.

**Work:**
- Create `pr-description-builder.ts` with function `buildPRDescription(cwd: string, phaseName: string, fs: Filesystem): Promise<string>`
- Read `.ushabti/phases/{phase-id}-{slug}/phase.md` to extract intent, scope, and acceptance criteria
- Read `.ushabti/phases/{phase-id}-{slug}/steps.md` to list completed steps
- Format a rich markdown description with sections: Summary, Changes, and Steps Completed
- Handle missing files gracefully by returning a minimal fallback description

**Done when:** Function returns multi-paragraph markdown prose summarizing the phase work.

## S004: Update git-post-phase to use rich descriptions and capture PR URL

**Intent:** Use the rich PR description builder and store the PR URL in pharaoh.json.

**Work:**
- Modify `git-post-phase.ts` to accept `Filesystem` and `cwd` parameters
- Replace `buildPRBody()` call with `buildPRDescription()` from the PR builder module
- Capture the PR URL from `GitOperations.openPR()` result
- Return the PR URL from `finalizeGreenPhase()` so watcher can store it in status

**Done when:** `finalizeGreenPhase()` returns `Promise<string | null>` with PR URL on success.

## S005: Track git branch at server startup and through status transitions

**Intent:** Show the current git branch in pharaoh.json at all times, including idle.

**Work:**
- Modify server startup to query `GitOperations.getCurrentBranch()` before setting idle status
- Pass git branch to `StatusManager.setIdle()` via `SetIdleInput`
- Update `watcher.ts` to pass git branch to done/blocked status setters
- Update `status-setters.ts` to preserve optional gitBranch fields

**Done when:** `pharaoh.json` includes `gitBranch` field in idle, done, and blocked statuses.

## S006: Update tests for new PR URL and gitBranch behavior

**Intent:** Ensure all conditional paths in updated modules are covered by tests.

**Work:**
- Update `git.test.ts` to verify `openPR()` extracts PR URL from stdout
- Create `pr-description-builder.test.ts` to test rich description generation and fallback behavior
- Update `git-post-phase.test.ts` to verify PR URL capture and return
- Update `watcher-helpers.test.ts` to verify git branch propagation in status transitions
- Update `status-setters.test.ts` to verify optional prUrl and gitBranch fields

**Done when:** All tests pass and cover new conditional paths.

## S007: Reconcile documentation with new JSON schema

**Intent:** Update `.ushabti/docs/index.md` to reflect new `prUrl` and `gitBranch` fields in status JSON.

**Work:**
- Update "Status File Schema" section with new optional fields in idle, done, and blocked examples
- Add note explaining that `prUrl` is only present when `gh` CLI successfully creates a PR
- Add note explaining that `gitBranch` is only present when running in a git repository
- Update "Git Integration" section to describe rich PR descriptions

**Done when:** Documentation accurately reflects new JSON schema and PR behavior.

## S008: Bump package version to 0.1.10

**Intent:** Increment the package version to reflect new features.

**Work:**
- Update `package.json` version from `0.1.9` to `0.1.10`

**Done when:** `package.json` shows version `0.1.10`.
