# Phase 0002: Add Greet Function

## Intent

Add a `greet(name: string): string` function to demonstrate basic TypeScript function typing and string interpolation in the test fixture. This establishes a simple, typed function pattern before introducing the incrementer logic in future phases.

## Scope

**In Scope:**
- Add a `greet(name: string): string` function to `src/index.ts` that returns `"Hello, {name}! Welcome to the PHU stack."`
- Update the main script to call `greet("World")` instead of the direct `console.log()`
- Print the returned greeting to stdout
- Verify the output matches expected format

**Out of Scope:**
- Tests (deferred to future phases when testing infrastructure is established)
- Incrementer logic (that's separate work)
- Multiple functions or complex control flow
- Documentation updates (docs are currently scaffold-only)

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: This is a safe, additive change. No destructive operations.
- **L02 (Only the Incrementer May Change)**: This adds foundational code, not the incrementer itself. The incrementer will be introduced in a future phase.
- **L03 (Full Ceremony Required)**: This Phase follows the full Scribe → Builder → Overseer ceremony.
- **L04-L07 (Documentation)**: Documentation is currently scaffold-only. No system documentation exists yet, so no updates required.

**Relevant Style:**
- **Single File Constraint**: All code remains in `src/index.ts`. No additional files.
- **Minimal Dependencies**: No external dependencies needed. Uses only TypeScript language features.
- **Plain TypeScript**: Simple function with explicit type annotations. No decorators or metaprogramming.

## Acceptance Criteria

1. `src/index.ts` contains a function with signature `greet(name: string): string`
2. The `greet` function returns a string in the format `"Hello, {name}! Welcome to the PHU stack."` where `{name}` is replaced with the provided argument
3. The main script calls `greet("World")` and prints the result to stdout
4. Running `npm run build` compiles successfully without errors
5. Running `npm start` outputs exactly `"Hello, World! Welcome to the PHU stack!"` to stdout
6. No additional files, dependencies, or architectural changes beyond the function addition

## Risks / Notes

**Foundational Work:** This Phase establishes a basic function pattern before introducing the incrementer. The incrementer will be the actual "work" that changes across iterations (per L02), but this Phase sets up the structure.

**Output Change:** The output will change from `"Hello from the PHU stack!"` to `"Hello, World! Welcome to the PHU stack!"`. This is intentional and expected.

**No Tests Yet:** Testing infrastructure will be established in a future phase. For now, manual verification via `npm start` is sufficient.
