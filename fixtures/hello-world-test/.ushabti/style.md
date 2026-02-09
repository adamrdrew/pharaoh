# Project Style Guide

## Purpose

This style guide defines conventions for the hello-world-test fixture. This project validates the Pharaoh Ushabti runner with minimal, intentionally constrained scope. Style enforces simplicity and prevents over-engineering.

## Project Structure

```
hello-world-test/
├── .ushabti/           # Ushabti ceremony files
├── src/
│   └── index.ts        # Single entry point - all code goes here
└── package.json        # Minimal dependencies only
```

### Single File Constraint

All production code MUST reside in a single file: `src/index.ts`.

- Do NOT split code across multiple files
- Do NOT create subdirectories in `src/`
- Do NOT introduce module boundaries or imports between project files
- All logic, types, and implementation live in one file

**Rationale:** This is a minimal test fixture. Simplicity is the goal. Multi-file architecture adds complexity without value.

## Language & Tooling Conventions

### Language

TypeScript (version determined by `package.json`)

### Dependencies

Keep dependencies minimal or nonexistent.

- AVOID importing external libraries unless absolutely required
- AVOID framework dependencies
- Prefer standard library and built-in capabilities
- If a dependency is added, it must have clear justification

**Rationale:** This fixture validates workflow, not dependency management. External imports create maintenance burden and obscure the core logic.

## Architectural Patterns

### Preferred

- **Inline everything:** Functions, types, constants all in `src/index.ts`
- **Plain TypeScript:** Use standard language features, no decorators or advanced metaprogramming
- **Direct execution:** Code runs without elaborate setup or initialization

### Discouraged / Forbidden

- **Multi-file architecture:** Explicitly forbidden (see Single File Constraint)
- **External libraries:** Strongly discouraged unless justified
- **Over-abstraction:** No interfaces for single implementations, no unnecessary generics
- **Build complexity:** No custom webpack configs, no elaborate tsconfig settings beyond basics

**Rationale:** This project exists to test the Ushabti workflow. The simpler the codebase, the more clearly it demonstrates the ceremony.

## Testing Strategy

### What Must Be Tested

Tests for the incrementer logic (per Law L02, this is the only code that changes).

### Where Tests Live

- Tests MAY live in `src/index.test.ts` or inline in `src/index.ts`
- If a test framework is used, keep configuration minimal

### Acceptable Tradeoffs

Comprehensive test coverage is NOT required. Incrementer behavior must be verified, but exhaustive edge case testing is unnecessary.

## Error Handling & Observability

### Error Handling

- Use simple error messages
- Throw errors directly when problems occur
- Do NOT build elaborate error hierarchies or custom error classes

### Logging

- Use `console.log` for output
- No logging frameworks
- Keep messages concise and human-readable

**Rationale:** This is a test fixture, not production software. Simple error handling is sufficient.

## Performance & Resource Use

No performance requirements. This code will run locally for validation purposes.

- Do NOT optimize prematurely
- Do NOT introduce caching, pooling, or resource management complexity

## Review Checklist

When Overseer reviews a Phase, verify:

- [ ] All production code is in a single file (`src/index.ts`)
- [ ] No unnecessary external dependencies were added
- [ ] Code is simple and straightforward (no over-engineering)
- [ ] Incrementer logic works correctly
- [ ] No multi-file architecture introduced
- [ ] Changes comply with Law L02 (only incrementer may change)
- [ ] No security vulnerabilities or destructive operations (Law L01)

---

### Writing Rules Applied

- Be explicit: Single file constraint is stated multiple times with rationale
- Be actionable: Checklist items are concrete and verifiable
- Prefer examples: Directory structure shown explicitly
- Avoid vague terms: "Simple" is contextualized with specific anti-patterns
