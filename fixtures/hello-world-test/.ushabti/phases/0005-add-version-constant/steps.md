# Implementation Steps

## S001: Add VERSION constant

**Intent:** Declare the version string as a top-level constant for reference throughout the application.

**Work:**
- Open `src/index.ts`
- Add `const VERSION = "0.1.0";` at the very top of the file, before any function declarations

**Done when:**
- The VERSION constant exists at the top of `src/index.ts`
- TypeScript compilation succeeds (no syntax errors)

---

## S002: Print version as first output line

**Intent:** Display the version to stdout so users and validation systems can identify which version is running.

**Work:**
- Add `console.log(`v${VERSION}`);` as the first console.log statement in the file
- Ensure this line executes before the timestamp, greet, and farewell outputs

**Done when:**
- Running `npm start` prints `v0.1.0` as the first line to stdout
- Timestamp, greet, and farewell lines appear afterward in their current order

---

## S003: Verify build and output

**Intent:** Confirm the changes compile cleanly and produce the expected output.

**Work:**
- Run `npm run build` to verify TypeScript compilation succeeds
- Run `npm start` to verify output order: version first, then timestamp, then greet, then farewell

**Done when:**
- `npm run build` completes without errors
- `npm start` outputs four lines in the correct order: version, timestamp, greet, farewell
- No regressions in existing functionality
