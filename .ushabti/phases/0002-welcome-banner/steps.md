# Steps

## S001: Read version from package.json

**Intent:** Extract the version string from package.json to include in the startup banner.

**Work:**
- In `serve()` function, after filesystem is initialized, read `package.json` from `path.join(cwd, 'package.json')` using `fs.readFile()`
- Parse the JSON content and extract the `version` field
- If read or parse fails, set version to `"unknown"`
- Store version in a `const version` binding

**Done when:**
- Version is successfully read from package.json and stored in a variable
- Errors during read or parse are caught and result in version being set to `"unknown"`
- Implementation uses the injected `fs` instance, not direct filesystem access

## S002: Add startup banner logs

**Intent:** Log the startup banner immediately after the idle status is set, providing operators with immediate confirmation of server state.

**Work:**
- After `await status.setIdle(pid, started)` in the `serve()` function, add 2-3 `logger.info()` calls
- First log: Welcome message with project name and version
  - Message: `"Pharaoh v{version} starting"`
  - Context: `{ version, cwd }`
- Second log: Directory being served
  - Message: `"Serving directory"`
  - Context: `{ cwd, dispatchPath }`
- Ensure all banner entries use structured context fields (no string concatenation in the message)

**Done when:**
- Banner logs appear immediately after idle status is set
- Banner includes project name, version, and working directory
- All banner entries use `logger.info()` with structured context
- Banner contains no ASCII art or color codes
- Logs are clean and suitable for structured log aggregation

## S003: Fix structured logging violation in banner

**Intent:** Correct the banner log message to use static message with structured context only.

**Work:**
- In `src/index.ts` line 100, change the log message from `` `Pharaoh v${version} starting` `` to `'Pharaoh starting'`
- Keep the structured context unchanged: `{ version, cwd }`
- Verify the version still appears in log output via the context object

**Done when:**
- Banner log message is a static string with no template interpolation
- Version information is present only in the structured context object
- Log output remains human-readable and includes all required metadata

## S004: Reconcile documentation after S003 fix

**Intent:** Update documentation to reflect the actual static log message format implemented in S003.

**Work:**
- In `.ushabti/docs/index.md` line 191, change the example log message from `[INFO] Pharaoh v0.1.0 starting` to `[INFO] Pharaoh starting`
- Keep the structured context unchanged: `{"version":"0.1.0","cwd":"/path/to/project"}`
- Verify the example accurately reflects the actual log output format

**Done when:**
- Documentation example matches the actual code behavior
- Static message format is correctly documented
- Version appears only in structured context, not in message text

## S005: Add tests for version reading logic

**Intent:** Provide test coverage for the version reading conditional paths to satisfy Law L09.

**Work:**
- Set up test infrastructure (vitest, test directory)
- Extract version reading to a testable helper function if needed
- Write tests covering:
  - Success path: valid package.json with version field
  - Error path: missing package.json file
  - Error path: malformed JSON in package.json
  - Edge case: package.json exists but has no version field
- Verify all tests pass

**Done when:**
- All conditional paths in version reading are tested
- Tests use test doubles (no real filesystem access per L08)
- Tests are deterministic and independent (L10)
- All tests pass

**Alternative:**
If testing infrastructure is deferred to a later phase, explicitly document this as technical debt and obtain approval to waive L09 for this bootstrap phase.
