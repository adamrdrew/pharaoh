# Phase 0004: Add Timestamp Function

## Intent

Add a `timestamp(): string` function to provide ISO8601-formatted timestamps and print the current timestamp to stdout before the existing greeting and farewell messages. This establishes a simple timestamp utility that can be used for logging or time-based features in future phases.

## Scope

**In Scope:**
- Add a `timestamp(): string` function to `src/index.ts` that returns the current date and time in ISO8601 format
- Call `timestamp()` at the start of the main script
- Print the timestamp to stdout before the existing `greet("World")` call
- Verify the complete output sequence: timestamp, greeting, farewell

**Out of Scope:**
- Incrementer logic (deferred to future phases)
- Testing infrastructure (no tests yet)
- Timezone handling or custom date formatting
- Refactoring existing `greet` or `farewell` functions
- Documentation updates (docs are currently scaffold-only)

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: This is a safe, additive change. No destructive operations.
- **L02 (Only the Incrementer May Change)**: This adds foundational code, not the incrementer itself. The incrementer remains future work.
- **L03 (Full Ceremony Required)**: This Phase follows the full Scribe → Builder → Overseer ceremony.
- **L04-L07 (Documentation)**: Documentation is currently scaffold-only. No system documentation exists yet, so no updates required.

**Relevant Style:**
- **Single File Constraint**: All code remains in `src/index.ts`. No additional files.
- **Minimal Dependencies**: Uses built-in JavaScript `Date` API. No external dependencies needed.
- **Plain TypeScript**: Simple function with explicit type annotations, matching the pattern established in `greet` and `farewell`.

## Acceptance Criteria

1. `src/index.ts` contains a function with signature `timestamp(): string`
2. The `timestamp` function returns the current date and time as an ISO8601 string (using `new Date().toISOString()`)
3. The main script calls `timestamp()` before the existing `greet("World")` call and prints the result to stdout
4. Running `npm run build` compiles successfully without errors
5. Running `npm start` outputs three lines in order:
   - An ISO8601 timestamp (format: `YYYY-MM-DDTHH:mm:ss.sssZ`)
   - `"Hello, World! Welcome to the PHU stack!"`
   - `"Goodbye, World! See you next time."`
6. No additional files, dependencies, or architectural changes beyond the function addition
7. The existing `greet` and `farewell` functions and their output remain unchanged

## Risks / Notes

**Pattern Consistency:** This Phase follows the same pattern as Phases 0002 and 0003. The `timestamp` function has a simple signature (no parameters, string return type) and uses built-in language features.

**ISO8601 Format:** Using `new Date().toISOString()` provides a standard, unambiguous timestamp format suitable for logging and debugging. No timezone conversion or custom formatting is needed for this simple fixture.

**Sequential Execution:** The timestamp appears first, establishing a temporal marker before the greeting sequence. This could support future features like execution duration tracking or time-based logic.

**No Tests Yet:** Testing infrastructure will be established in a future phase. For now, manual verification via `npm start` is sufficient. The timestamp will vary with each run, which is expected behavior.
