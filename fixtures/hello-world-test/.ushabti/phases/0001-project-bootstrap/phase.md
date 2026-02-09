# Phase 0001: Project Bootstrap

## Intent

Bootstrap the minimal TypeScript infrastructure for the hello-world-test fixture. This Phase establishes the foundation — a single-file CLI application that compiles and runs successfully. This is the prerequisite for all subsequent work, providing the simplest possible codebase to validate the Ushabti workflow.

## Scope

**In Scope:**
- Create `package.json` with minimal configuration (name, version, type module)
- Create `tsconfig.json` with strict TypeScript settings
- Create `src/index.ts` with a simple "Hello from the PHU stack!" output
- Install TypeScript and `@types/node` as dev dependencies
- Add `build` and `start` scripts to verify the toolchain works
- Verify compilation succeeds with `npm run build`

**Out of Scope:**
- Tests (deferred to future phases)
- Runtime dependencies beyond Node.js standard library
- Multiple source files (style requires single-file constraint)
- Incrementer logic (that's the actual work; this is just scaffolding)
- Documentation updates (docs are currently scaffold-only)

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: All operations must be safe and reversible. No destructive actions.
- **L03 (Full Ceremony Required)**: This is the first Phase through the ceremony. Bootstrap exception applies — this establishes the infrastructure that future phases will modify.
- **L04 (Scribe Documentation Consultation)**: Docs are scaffold-only; bootstrap exception applies.

**Relevant Style:**
- **Single File Constraint**: All production code must reside in `src/index.ts`. No multi-file architecture.
- **Minimal Dependencies**: Only TypeScript tooling allowed. No external libraries.
- **Plain TypeScript**: No decorators, frameworks, or advanced metaprogramming.

## Acceptance Criteria

1. `package.json` exists with correct metadata (name: `hello-world-test`, version: `0.1.0`, type: `module`)
2. `package.json` contains `build` script that runs `tsc` and `start` script that runs `node dist/index.js`
3. `tsconfig.json` exists with strict mode enabled, ES2022 target, NodeNext module resolution
4. `src/index.ts` exists and contains code that outputs "Hello from the PHU stack!" to stdout
5. `typescript` and `@types/node` are installed as dev dependencies
6. Running `npm run build` compiles successfully without errors
7. Running `npm start` (after build) outputs "Hello from the PHU stack!" to stdout
8. No additional files or dependencies beyond those listed in scope

## Risks / Notes

**Bootstrap Exception:** This Phase uses the L03 bootstrap exception — it's creating the project infrastructure before the first "real" Phase that modifies the incrementer. Future changes must go through full ceremony.

**Intentionally Minimal:** The code should be as simple as possible. A single `console.log()` statement is sufficient. Over-engineering would violate the spirit of this fixture.

**No Documentation Updates:** The docs are currently scaffold-only. Surveyor should run after this Phase to document the initial structure. This Phase focuses solely on getting the toolchain operational.
