# Phase 0003: Add Farewell Function

## Intent

Add a `farewell(name: string): string` function to demonstrate a second typed function following the same pattern as `greet`. This builds on the function pattern established in Phase 0002 and prepares the fixture for more complex multi-step execution flows in future phases.

## Scope

**In Scope:**
- Add a `farewell(name: string): string` function to `src/index.ts` that returns `"Goodbye, {name}! See you next time."`
- Call `farewell("World")` after the existing `greet("World")` call
- Print the farewell result to stdout on a new line

**Out of Scope:**
- Incrementer logic (deferred to future phases)
- Testing infrastructure (no tests yet)
- Refactoring existing `greet` function
- Documentation updates (docs are currently scaffold-only)

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: Safe, additive change. No destructive operations.
- **L02 (Only the Incrementer May Change)**: This adds foundational code, not the incrementer. The incrementer remains future work.
- **L03 (Full Ceremony Required)**: This Phase follows the full Scribe → Builder → Overseer ceremony.
- **L04-L07 (Documentation)**: Documentation is currently scaffold-only. No system documentation exists yet, so no updates required.

**Relevant Style:**
- **Single File Constraint**: All code remains in `src/index.ts`. No additional files.
- **Minimal Dependencies**: No external dependencies needed. Uses only TypeScript language features.
- **Plain TypeScript**: Simple function with explicit type annotations, matching the pattern established in `greet`.

## Acceptance Criteria

1. `src/index.ts` contains a function with signature `farewell(name: string): string`
2. The `farewell` function returns a string in the format `"Goodbye, {name}! See you next time."` where `{name}` is replaced with the provided argument
3. The main script calls `farewell("World")` after the `greet("World")` call and prints the result to stdout
4. Running `npm run build` compiles successfully without errors
5. Running `npm start` outputs two lines:
   - `"Hello, World! Welcome to the PHU stack!"`
   - `"Goodbye, World! See you next time."`
6. No additional files, dependencies, or architectural changes beyond the function addition
7. The existing `greet` function and its output remain unchanged

## Risks / Notes

**Pattern Consistency:** This Phase mirrors Phase 0002's approach. The `farewell` function follows the same signature pattern as `greet` (single string parameter, string return type, template literal interpolation).

**Sequential Execution:** The farewell message appears after the greeting, establishing a simple sequential execution pattern that can be extended in future phases.

**No Tests Yet:** Testing infrastructure will be established in a future phase. For now, manual verification via `npm start` is sufficient.
