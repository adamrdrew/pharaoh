# Implementation Steps

## S001: Add timestamp function

**Intent**: Define a typed function that returns the current timestamp in ISO8601 format.

**Work**:
- Add a function named `timestamp` to `src/index.ts`
- Function signature: `timestamp(): string`
- Function body: return `new Date().toISOString()`
- Place the function definition with the other utility functions (after `greet` and `farewell`, or before them)

**Done when**:
- `src/index.ts` contains the `timestamp` function with correct signature
- Function returns an ISO8601 formatted string using `Date.toISOString()`
- Code compiles successfully with `npm run build`

## S002: Call timestamp before greetings

**Intent**: Print the current timestamp to stdout before the existing greeting sequence.

**Work**:
- Add a call to `timestamp()` at the start of the main script (before the `greet("World")` call)
- Print the result to stdout using `console.log()`
- Ensure the timestamp appears on its own line before the greeting

**Done when**:
- Main script calls `timestamp()` before `greet("World")`
- The returned timestamp is printed to stdout
- Code compiles successfully with `npm run build`
- The timestamp appears on a separate line from the greeting

## S003: Verify complete output sequence

**Intent**: Confirm the complete functionality works end-to-end with the correct output order.

**Work**:
- Run `npm run build` to compile
- Run `npm start` to execute
- Verify output contains three lines in order:
  1. ISO8601 timestamp (format: `YYYY-MM-DDTHH:mm:ss.sssZ`)
  2. `"Hello, World! Welcome to the PHU stack!"`
  3. `"Goodbye, World! See you next time."`

**Done when**:
- Build succeeds without errors or warnings
- Runtime output shows all three lines in the correct order
- Timestamp format is valid ISO8601 (verified by visual inspection)
- Existing greeting and farewell output remain unchanged
- No regressions (build and start scripts still work as expected)
