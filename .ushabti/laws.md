# Project Laws

## Preamble

These laws define the non-negotiable invariants for Pharaoh. Every Phase, implementation, and refactor must preserve these constraints. Overseer MUST verify compliance during review. Any violation fails the Phase.

## Laws

### L01 — TypeScript Strict Mode

- **Rule:** `tsconfig.json` MUST have `strict: true` enabled. This setting MUST NOT be disabled or downgraded.
- **Rationale:** Strict mode prevents entire classes of runtime errors through compile-time guarantees.
- **Enforcement:** Verify `tsconfig.json` contains `"strict": true` in `compilerOptions`.
- **Exceptions:** None

### L02 — No Any Type

- **Rule:** The `any` type MUST NOT be used anywhere in the codebase. This includes explicit `any` and implicit `any`.
- **Rationale:** `any` defeats TypeScript's type safety and hides bugs.
- **Enforcement:** Search codebase for `: any` and verify TSConfig has `noImplicitAny: true` (enabled by strict mode).
- **Exceptions:** None

### L03 — No Type Assertions Except at System Boundaries

- **Rule:** Type assertions (the `as` keyword) MUST NOT be used except at validated system boundaries (e.g., parsing external input with runtime validation).
- **Rationale:** Type assertions bypass type checking and can introduce runtime type errors. They are only safe when validating external data.
- **Enforcement:** Search for ` as ` in code. Each usage must be at a system boundary with accompanying runtime validation.
- **Exceptions:** System boundaries where external data enters the application AND runtime validation is present.

### L04 — Explicit Return Types on Public Functions

- **Rule:** Every public function and method MUST have an explicit return type annotation.
- **Rationale:** Explicit return types prevent unintended API changes and serve as inline documentation.
- **Enforcement:** Review all exported functions and public class methods for `: ReturnType` annotations.
- **Exceptions:** None

### L05 — Single Responsibility Principle

- **Rule:** Every class and module MUST have a single, well-defined responsibility. Objects that combine multiple concerns MUST be refactored.
- **Rationale:** Single-responsibility objects are easier to test, maintain, and reason about.
- **Enforcement:** Review class and module purposes. If a class has multiple reasons to change, it violates SRP.
- **Exceptions:** None

### L06 — Dependency Injection Required

- **Rule:** All external dependencies MUST be injectable through constructor parameters or method parameters. Classes MUST NOT directly instantiate their dependencies.
- **Rationale:** Dependency injection enables testing, supports the Open/Closed Principle, and makes dependencies explicit.
- **Enforcement:** Review constructors and methods. Dependencies should be parameters, not created internally.
- **Exceptions:** None

### L07 — Side Effects Behind Injectable Interfaces

- **Rule:** All side effects (filesystem operations, SDK calls, process signals, network I/O) MUST be abstracted behind injectable interfaces.
- **Rationale:** Abstracting side effects enables unit testing without touching real systems and supports dependency injection.
- **Enforcement:** Verify that filesystem, SDK, process, and network operations are abstracted behind interfaces and injected as dependencies.
- **Exceptions:** None

### L08 — Unit Tests Must Not Touch Real Systems

- **Rule:** Unit tests MUST NOT touch the real filesystem, spawn real processes, make network calls, or invoke real external systems. All side effects MUST be mocked or stubbed.
- **Rationale:** Unit tests that touch real systems are slow, brittle, and non-deterministic.
- **Enforcement:** Review test files. Verify that all side effects use test doubles (mocks, stubs, fakes).
- **Exceptions:** Integration tests (which MUST be clearly separated from unit tests).

### L09 — Test Coverage of All Conditional Paths

- **Rule:** All public methods MUST have tests that cover all conditional paths (if/else branches, switch cases, error conditions).
- **Rationale:** Untested conditional paths are likely to contain bugs.
- **Enforcement:** Review tests for each public method. Verify that all branches and error conditions are exercised.
- **Exceptions:** None

### L10 — Tests Must Be Deterministic and Independent

- **Rule:** Every test MUST produce the same result on every run. Tests MUST NOT depend on execution order or shared state.
- **Rationale:** Non-deterministic or order-dependent tests are unreliable and mask real failures.
- **Enforcement:** Run test suite multiple times in different orders. All runs must produce identical results.
- **Exceptions:** None

### L11 — Tests Cover Our Code, Not Libraries

- **Rule:** Tests MUST NOT test library behavior. Tests MUST verify our code's logic and integration with libraries.
- **Rationale:** Testing library behavior wastes time and creates brittle tests. We trust libraries to test themselves.
- **Enforcement:** Review tests. Verify they assert on our code's behavior, not the behavior of third-party libraries.
- **Exceptions:** None

### L12 — Open/Closed Principle

- **Rule:** The system MUST be designed for extension without modification. New behavior MUST be added through composition or inheritance, not by modifying existing code.
- **Rationale:** Modifying existing code to add features increases bug risk and violates the stability guarantee.
- **Enforcement:** Review changes that add features. New behavior should extend existing abstractions, not modify them.
- **Exceptions:** Bug fixes and refactoring for maintainability.

### L13 — No Dead Code

- **Rule:** Unreachable code, unused functions, unused imports, and commented-out code MUST NOT be committed.
- **Rationale:** Dead code creates confusion, increases maintenance burden, and hides real code.
- **Enforcement:** Search for unused exports, unreachable branches, and commented code blocks. Remove all dead code.
- **Exceptions:** None

### L14 — Truthful Naming Required

- **Rule:** All identifiers (variables, functions, classes, modules) MUST accurately describe their purpose and behavior. Misleading or vague names are prohibited.
- **Rationale:** Truthful naming is the foundation of maintainable code. Misleading names cause bugs.
- **Enforcement:** Review naming during code review. Names must reflect actual behavior, not aspirational or outdated behavior.
- **Exceptions:** None

### L15 — Documentation Reconciliation on Every Phase

- **Rule:** Builder MUST consult `.ushabti/docs` during implementation and MUST update documentation when code changes affect documented systems. Overseer MUST verify documentation reconciliation before marking a Phase complete.
- **Rationale:** Stale documentation is a defect. Documentation must stay current with code to remain useful.
- **Enforcement:** Before marking a Phase GREEN, verify that all affected documentation in `.ushabti/docs` has been updated to reflect code changes.
- **Exceptions:** None

### L16 — Scribe Must Consult Documentation

- **Rule:** Scribe MUST consult `.ushabti/docs` when planning Phases. Understanding documented systems is a prerequisite to coherent planning.
- **Rationale:** Ignorance of existing systems leads to incoherent or contradictory planning.
- **Enforcement:** Scribe must reference relevant documentation files when defining Phase scope and acceptance criteria.
- **Exceptions:** Bootstrap phases where no documentation yet exists.

### L17 — Phase Completion Requires Documentation Reconciliation

- **Rule:** A Phase CANNOT be marked GREEN/complete until documentation is reconciled with code changes performed during that Phase.
- **Rationale:** Stale documentation is a defect. Phase completion implies all work is done, including documentation maintenance.
- **Enforcement:** Overseer must verify documentation updates before approving Phase completion.
- **Exceptions:** None

### L18 — Semantic Versioning Required

- **Rule:** The project MUST use semantic versioning (MAJOR.MINOR.PATCH) from the start. Version numbers MUST be incremented according to semver rules.
- **Rationale:** Semantic versioning provides clear expectations about compatibility and breaking changes.
- **Enforcement:** Verify `package.json` version follows semver format. Review changes to determine correct version increment.
- **Exceptions:** Pre-1.0.0 versions may have different semantics as documented in semver spec.

### L19 — Changelog Maintenance Required

- **Rule:** A changelog MUST be maintained from the start. Every user-facing change, breaking change, and deprecation MUST be documented.
- **Rationale:** Users need to understand what changed between versions to upgrade safely.
- **Enforcement:** Verify changelog exists and documents all significant changes.
- **Exceptions:** Internal refactoring with no external impact may be omitted.
