# Project Laws

## Preamble

These laws define the non-negotiable invariants for the hello-world-test fixture. This is a test project for validating the Pharaoh Ushabti runner. Every Phase, implementation, and refactor must preserve these constraints. Overseer MUST verify compliance during review. Any violation fails the Phase.

## Laws

### L01 — Do No Harm

- **Rule:** No code changes may introduce security vulnerabilities, data loss, system instability, or destructive operations. All operations MUST be safe and reversible.
- **Rationale:** This is a test fixture. Safety is paramount. Destructive operations would invalidate its purpose as a stable validation target.
- **Enforcement:** Review all code changes for potential harm. Verify no operations delete files outside the project, modify system state, or introduce security risks.
- **Exceptions:** None

### L02 — Only the Incrementer May Change

- **Rule:** The ONLY production code that may be modified across development iterations is the incrementer logic (the mechanism that increments the count value). All other code MUST remain stable.
- **Rationale:** This fixture tests the Ushabti workflow with minimal scope. Constraining changes to the incrementer ensures predictable, focused work that validates the ceremony without introducing unnecessary complexity.
- **Enforcement:** During review, verify that changes are limited to:
  - The incrementer function/logic itself
  - The count value or its storage mechanism
  - Related tests for the incrementer

  ANY changes to application structure, dependencies, configuration (outside incrementer-specific config), or unrelated features violate this law.
- **Scope:** Production code in `src/`. Test code, documentation, and Ushabti ceremony files (phases, reviews) are exempt.
- **Exceptions:**
  - Bug fixes that prevent the application from running
  - Dependency security updates that are critical
  - Changes explicitly required to support incrementer modifications (e.g., adding a storage mechanism if none exists)

### L03 — Full Ceremony Required

- **Rule:** All work MUST go through the complete Ushabti ceremony: Scribe plans the Phase, Builder implements it, Overseer reviews it. No shortcuts. No direct commits without a Phase. No skipping agents.
- **Rationale:** This fixture exists to validate the Pharaoh runner and Ushabti workflow. Bypassing the ceremony defeats its purpose. Even trivial changes must follow the loop to ensure the workflow functions correctly.
- **Enforcement:** Verify that every code change corresponds to a Phase in `.ushabti/phases/`. Each Phase must have:
  - `phase.md` (Scribe's plan)
  - `steps.md` (Scribe's implementation steps)
  - `progress.yaml` (Builder's progress tracking)
  - `review.md` (Overseer's review)

  Commits without corresponding Phase directories violate this law.
- **Exceptions:**
  - Bootstrap infrastructure (initial project setup before the first Phase)
  - Ushabti meta-files (laws, style, docs scaffold)

### L04 — Scribe Documentation Consultation

- **Rule:** Scribe MUST consult `.ushabti/docs` to inform Phase planning. Understanding documented systems is prerequisite to coherent planning.
- **Rationale:** Ignorance of existing systems leads to incoherent or contradictory planning.
- **Enforcement:** Scribe must reference relevant documentation files when defining Phase scope and acceptance criteria.
- **Exceptions:** Bootstrap phases where no documentation yet exists.

### L05 — Builder Documentation Maintenance

- **Rule:** Builder MUST consult `.ushabti/docs` during implementation and MUST update docs when code changes affect documented systems. Docs are both a resource and a maintenance responsibility.
- **Rationale:** Documentation must remain accurate and current. Stale docs are defects.
- **Enforcement:** Verify that Builder has updated documentation for any systems modified during the Phase.
- **Exceptions:** None

### L06 — Overseer Documentation Reconciliation

- **Rule:** Overseer MUST verify that docs are reconciled with code changes before declaring a Phase complete. Stale docs are defects.
- **Rationale:** Phase completion implies all work is done, including documentation maintenance.
- **Enforcement:** Before marking a Phase GREEN, verify that all affected documentation in `.ushabti/docs` has been updated to reflect code changes.
- **Exceptions:** None

### L07 — Phase Completion Requires Documentation Reconciliation

- **Rule:** A Phase cannot be marked GREEN/complete until docs are reconciled with the code work performed during that Phase.
- **Rationale:** Stale documentation is a defect. Phase completion implies all work is done.
- **Enforcement:** Overseer must verify documentation updates before approving Phase completion.
- **Exceptions:** None
