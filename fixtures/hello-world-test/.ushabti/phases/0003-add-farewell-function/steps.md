# Implementation Steps

## S001: Add farewell function

**Intent:** Define the `farewell` function with the same signature pattern as `greet`.

**Work:**
- Add a `farewell(name: string): string` function to `src/index.ts`
- Implement it to return the template literal `"Goodbye, ${name}! See you next time."`
- Place the function definition after the `greet` function

**Done when:**
- `src/index.ts` contains a `farewell` function with explicit parameter and return types
- The function body uses template literal syntax to interpolate the `name` parameter
- TypeScript compilation succeeds without errors

## S002: Call farewell and print output

**Intent:** Execute the farewell function and display its result after the greeting.

**Work:**
- Add a call to `farewell("World")` after the existing `console.log(greet("World"))` line
- Wrap the result in `console.log()` to print to stdout

**Done when:**
- `src/index.ts` calls `farewell("World")` after greeting execution
- The farewell output is printed to stdout on a separate line
- Running `npm start` produces two lines of output: the greeting followed by the farewell

## S003: Verify output format

**Intent:** Confirm the application produces the expected output in the correct format.

**Work:**
- Run `npm run build` to compile the TypeScript
- Run `npm start` and verify the output contains both messages:
  - Line 1: `"Hello, World! Welcome to the PHU stack!"`
  - Line 2: `"Goodbye, World! See you next time."`

**Done when:**
- Build completes without errors
- Output matches the expected two-line format exactly
- No extraneous output or formatting issues
