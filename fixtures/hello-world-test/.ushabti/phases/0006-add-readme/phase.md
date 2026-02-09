# Phase 0006: Add README

## Intent

Add a README.md to the project root that describes what the hello-world-test fixture is and provides basic usage instructions. This makes the project immediately understandable to anyone encountering it, documenting its purpose as a Pharaoh/Ushabti validation fixture.

## Scope

**In Scope:**
- Create `README.md` in the project root
- Include: project name, one-line description, installation instructions (`npm install`), build instructions (`npm run build`), run instructions (`npm start`)
- Keep content brief (under 30 lines)
- Read `package.json` and `src/index.ts` to inform the description

**Out of Scope:**
- Comprehensive documentation (defer to `.ushabti/docs` or future phases)
- Badges, shields, CI status indicators
- Contribution guidelines, code of conduct, or governance docs
- API documentation or detailed architecture explanations
- Links to external resources or lengthy background

## Constraints

**Relevant Laws:**
- **L01 (Do No Harm)**: Adding a README is safe, non-destructive, and reversible
- **L02 (Only the Incrementer May Change)**: README is documentation, not production code. This does not violate the incrementer-only constraint.
- **L03 (Full Ceremony Required)**: Following the Scribe → Builder → Overseer loop
- **L04 (Scribe Documentation Consultation)**: Docs are scaffold-only; minimal context available
- **L05 (Builder Documentation Maintenance)**: Builder should consult docs, though README is user-facing rather than internal documentation

**Relevant Style:**
- **Single File Constraint**: Applies to `src/` production code, not root-level documentation
- **Minimal Dependencies**: README requires no dependencies
- **Simplicity**: Keep it brief and direct, matching the fixture's minimal, focused scope

## Acceptance Criteria

1. `README.md` exists in the project root (not in `src/` or `.ushabti/`)
2. README includes:
   - Project name ("hello-world-test" or similar)
   - One-line description explaining it's a Pharaoh/Ushabti validation fixture
   - Installation instructions (`npm install`)
   - Build instructions (`npm run build`)
   - Run instructions (`npm start`)
3. Content is concise (under 30 lines)
4. Running `npm run build` succeeds after the README is added (verifying no accidental code changes)
5. No production code modified (only the README file created)

## Risks / Notes

**Scope Creep Risk:** READMEs can grow large quickly. The acceptance criteria explicitly cap this at 30 lines to keep it minimal and aligned with the fixture's purpose.

**Documentation Boundary:** This README is user-facing, not part of `.ushabti/docs`. It explains how to use the project, not its internal systems. Overseer should verify this distinction is respected.

**L02 Compliance:** Adding documentation does not change production code. This is a safe, non-invasive phase that improves project usability without touching the incrementer or any other logic.
