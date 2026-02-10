# Implementation Steps

## S001: Add js-yaml dependency

**Intent**: Provide YAML parsing capability for reading `progress.yaml` files.

**Work**:
- Add `js-yaml` to `package.json` dependencies (not devDependencies)
- Add `@types/js-yaml` to `package.json` devDependencies for TypeScript support
- Run `npm install` to install the new dependencies

**Done when**:
- `package.json` contains `"js-yaml"` in dependencies section
- `package.json` contains `"@types/js-yaml"` in devDependencies section
- `node_modules` contains `js-yaml` package
- `npm run build` succeeds

## S002: Create phase directory finder

**Intent**: Identify the latest phase directory by scanning `.ushabti/phases/` and sorting by modification time.

**Work**:
- Create new file `src/status-check-finder.ts`
- Export `findLatestPhaseDir(basePath: string, fs: Filesystem): Promise<StatusCheckResult>` function
- Scan `.ushabti/phases/` for directories (not files)
- Use `fs.stat()` to get modification time for each directory
- Sort directories by mtime descending and return the first (most recent)
- Return typed error if phases directory doesn't exist or no subdirectories found
- Keep module under 100 lines per Sandi Metz rules

**Done when**:
- `status-check-finder.ts` exists with `findLatestPhaseDir()` function
- Function returns `StatusCheckResult` with directory path on success
- Function returns typed error if no phases found
- Explicit return type on function
- No `any` types used

## S003: Create YAML parser with validation

**Intent**: Parse `progress.yaml` and extract the `status` field with runtime validation.

**Work**:
- Create new file `src/status-check-parser.ts`
- Import `yaml` from `js-yaml`
- Export `parsePhaseStatus(yamlContent: string): StatusCheckResult` function
- Parse YAML using `yaml.load()`
- Validate that result is an object with a `phase` property
- Validate that `phase.status` exists and is a string
- Return status string in `StatusCheckResult` on success
- Return typed error if parsing fails or structure is invalid
- Keep module under 100 lines

**Done when**:
- `status-check-parser.ts` exists with `parsePhaseStatus()` function
- Function uses `yaml.load()` to parse content
- Runtime validation checks for `phase.status` field before accessing
- Returns typed error if YAML parsing throws
- Returns typed error if expected fields missing
- No type assertions without runtime validation (L03)
- Explicit return type on function

## S004: Rewrite status-check.ts to use filesystem

**Intent**: Replace agent-based status check with direct filesystem reads.

**Work**:
- Remove SDK `query()` import from `status-check.ts`
- Remove `pluginPath` parameter from `checkPhaseStatus()` signature
- Add `Filesystem` parameter to `checkPhaseStatus()` signature
- Import `findLatestPhaseDir()` from `status-check-finder.ts`
- Import `parsePhaseStatus()` from `status-check-parser.ts`
- Implement new `checkPhaseStatus()`: call finder to get latest phase dir, read `progress.yaml` from that dir, parse YAML, return status
- Remove obsolete functions: `executeStatusQuery()`, `buildQueryOptions()`, `extractMessageContent()`, `extractPhaseStatus()`
- Keep error handling function `buildErrorResult()` for consistency
- Maintain existing `StatusCheckResult` type unchanged

**Done when**:
- SDK imports removed from `status-check.ts`
- `checkPhaseStatus()` signature is `checkPhaseStatus(cwd: string, fs: Filesystem, logger: Logger): Promise<StatusCheckResult>`
- Function calls `findLatestPhaseDir()` to get latest phase directory path
- Function reads `{latestPhaseDir}/progress.yaml` using injected `Filesystem`
- Function calls `parsePhaseStatus()` to extract status from YAML content
- Returns `StatusCheckResult` with status string on success
- Returns typed error on any failure
- All agent-related functions deleted
- Module remains under 100 lines

## S005: Update runner-verification.ts signature

**Intent**: Thread the `Filesystem` dependency through verification instead of `pluginPath`.

**Work**:
- Change `verifyPhaseCompletion()` signature to accept `filesystem: Filesystem` instead of `pluginPath: string`
- Update call to `checkPhaseStatus()` to pass `filesystem` instead of `pluginPath`
- No logic changes — only parameter threading

**Done when**:
- `verifyPhaseCompletion()` signature is `verifyPhaseCompletion(sdkResult: PhaseResult, phaseName: string, cwd: string, filesystem: Filesystem, logger: Logger): Promise<PhaseResult>`
- Call to `checkPhaseStatus()` passes `filesystem` parameter
- TypeScript compiles without errors

## S006: Update runner.ts call site

**Intent**: Pass `Filesystem` dependency to verification instead of `pluginPath`.

**Work**:
- Find call to `verifyPhaseCompletion()` in `runner.ts`
- Update call to pass `this.filesystem` (or equivalent injected Filesystem) instead of `pluginPath`
- Remove `pluginPath` from any context objects if it's no longer needed elsewhere

**Done when**:
- Call to `verifyPhaseCompletion()` passes `filesystem` parameter
- No references to `pluginPath` remain in verification chain
- TypeScript compiles without errors
- `npm run build` succeeds

## S007: Update documentation

**Intent**: Reconcile documentation with the removal of agent-based verification (L15, L17).

**Work**:
- Open `.ushabti/docs/index.md`
- Find "Phase Status Verification" section
- Update description to explain filesystem-based verification approach
- Remove reference to "/phase-status latest" agent query
- Document that Pharaoh scans `.ushabti/phases/` for latest phase directory and reads `progress.yaml` directly
- Note that this eliminates false negatives from agent output parsing failures

**Done when**:
- Documentation section describes filesystem-based verification
- No references to agent-based status checking remain
- Documentation accurately reflects implementation
- Markdown formatting is clean

## S008: Verify build and existing tests

**Intent**: Ensure changes haven't broken compilation or existing test suite.

**Work**:
- Run `npm run build` to verify TypeScript compilation
- Run `npm test` to verify existing tests still pass
- If tests fail due to signature changes, update test mocks and assertions to match new `checkPhaseStatus()` signature
- Ensure all test updates maintain L08 compliance (no real filesystem access)

**Done when**:
- `npm run build` succeeds with no errors
- `npm test` succeeds with all tests passing
- Any test updates use `FakeFilesystem` for I/O
- Test coverage of modified code is equivalent to before changes

## S009: Eliminate type assertions in status-check-parser.ts

**Intent**: Remove type assertions that violate L03 by refactoring to use proper TypeScript type narrowing.

**Work**:
- Refactor `isValidStructure()` in `status-check-parser.ts` to eliminate `as Record<string, unknown>` assertions
- Use TypeScript's built-in narrowing with `in` checks and intermediate variables
- Maintain identical runtime behavior and validation logic
- Ensure function still acts as proper type guard

**Done when**:
- No `as` assertions remain in `status-check-parser.ts` (verify with `grep -n " as " src/status-check-parser.ts`)
- `isValidStructure()` still validates structure correctly
- TypeScript compilation succeeds with no errors
- Existing behavior unchanged (all error paths still work)

## S010: Add comprehensive unit tests for status-check modules

**Intent**: Provide test coverage for all conditional paths in status-check modules (L09 compliance).

**Work**:
- Create `tests/status-check.test.ts` with tests for all three modules
- Test `findLatestPhaseDir` success path with multiple directories sorted by mtime
- Test `findLatestPhaseDir` error paths: directory missing, empty directory
- Test `parsePhaseStatus` success path with valid phase.status
- Test `parsePhaseStatus` error paths: invalid YAML, missing phase field, missing status field, status not string
- Test `checkPhaseStatus` end-to-end integration covering success and error flows
- Use `FakeFilesystem` for all I/O operations (L08 compliance)
- Follow Arrange-Act-Assert pattern with descriptive test names

**Done when**:
- Test file exists at `tests/status-check.test.ts`
- Minimum 10 test cases covering all error paths
- All tests use `FakeFilesystem` (no real I/O)
- `npm test` passes with new tests included
- All conditional branches in status-check modules covered
