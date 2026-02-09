# Implementation Steps

## S001: Add greet function

**Intent**: Define a typed function that formats a personalized greeting message.

**Work**:
- Add a function named `greet` to `src/index.ts`
- Function signature: `greet(name: string): string`
- Function body: return `"Hello, {name}! Welcome to the PHU stack."` with string interpolation
- Place the function definition before the main script code

**Done when**:
- `src/index.ts` contains the `greet` function with correct signature
- Function returns the properly formatted string with the name parameter interpolated
- Code compiles successfully with `npm run build`

## S002: Update main script to use greet

**Intent**: Replace the direct console.log with a call to the new greet function.

**Work**:
- Remove the existing `console.log("Hello from the PHU stack!")`
- Add a call to `greet("World")`
- Print the result to stdout using `console.log()`

**Done when**:
- Main script calls `greet("World")`
- The returned value is printed to stdout
- No direct string literals remain in the main script
- Code compiles successfully with `npm run build`

## S003: Verify output

**Intent**: Confirm the complete functionality works end-to-end.

**Work**:
- Run `npm run build` to compile
- Run `npm start` to execute
- Verify output is exactly `"Hello, World! Welcome to the PHU stack!"`

**Done when**:
- Build succeeds without errors or warnings
- Runtime output matches expected format exactly
- No regressions (build and start scripts still work as expected)
