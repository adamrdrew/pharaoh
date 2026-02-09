# Phase 0005: Add Version Constant

## Intent

Add a VERSION constant to the application and display it as the first line of output. This establishes version identification for the fixture, making it clear which iteration of the code is running when validating the Pharaoh runner.

## Scope

**In Scope:**
- Add `const VERSION = "0.1.0"` to `src/index.ts`
- Print `"v0.1.0"` to stdout as the first line of output (before timestamp)
- Reorder existing console.log statements so version appears first

**Out of Scope:**
- Reading version from package.json or external files (single-file constraint favors inline constants)
- Version formatting beyond the simple "v{VERSION}" pattern
- Tests for version output (defer to future phases if needed)
- Documentation updates (docs are still scaffold-only)

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: Adding a constant and print statement is safe and reversible
- **L02 (Only the Incrementer May Change)**: This Phase adds version infrastructure, not incrementer logic. Proceeding on the assumption that we are still in the initial setup phase before the incrementer becomes the sole changing component.
- **L04 (Scribe Documentation Consultation)**: Docs are scaffold-only; minimal context available
- **L05 (Builder Documentation Maintenance)**: Builder must consult and update docs if this affects documented systems
- **L06 & L07 (Documentation Reconciliation)**: Overseer must verify docs are current before completion

**Relevant Style:**
- **Single File Constraint**: All code remains in `src/index.ts`
- **Plain TypeScript**: Use `const` for the version string, no elaborate versioning libraries
- **Minimal Dependencies**: No external dependencies required
- **Simple logging**: Use `console.log` directly

## Acceptance Criteria

1. `src/index.ts` contains `const VERSION = "0.1.0"` at the top level (not inside a function)
2. Running `npm start` outputs `v0.1.0` as the first line to stdout
3. Existing outputs (timestamp, greet, farewell) still appear, but after the version line
4. The code compiles successfully with `npm run build`
5. No new dependencies or files introduced
6. Documentation in `.ushabti/docs` is updated if any documented systems were affected

## Risks / Notes

**VERSION Placement:** The constant should be declared at the top of `src/index.ts` before any functions, establishing it as a top-level application constant.

**Output Ordering:** The version must be the first line printed. Current code prints timestamp first; this needs reordering.

**L02 Interpretation:** This Phase assumes we are still in the setup/bootstrap phase where non-incrementer code can be added. If the incrementer has already been established as the sole changing component, this Phase would violate L02 and should be rejected by Overseer.
