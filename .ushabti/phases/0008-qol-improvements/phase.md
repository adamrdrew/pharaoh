# Phase 0008: Quality of Life Improvements

## Intent

Improve Pharaoh's observability and git integration by adding PR URLs to pharaoh.json, enriching PR descriptions with detailed prose, displaying the current git branch in all status states, and bumping the package version.

## Scope

**In scope:**
- Add optional `prUrl` field to `ServiceStatusDone` and `ServiceStatusBlocked` types
- Modify `GitOperations.openPR()` to extract and return the PR URL from `gh pr create` output
- Add optional `gitBranch` field to `ServiceStatusIdle`, `ServiceStatusDone`, and `ServiceStatusBlocked`
- Modify git pre-phase operations to track the initial branch when idle
- Modify status setters and inputs to handle git branch across all states
- Create a new function to build rich PR descriptions by reading the phase directory
- Update `git-post-phase.ts` to use the rich PR description builder
- Update all affected tests to cover new functionality
- Reconcile documentation in `.ushabti/docs/index.md` to reflect new JSON schema and PR behavior
- Bump package.json version from 0.1.9 to 0.1.10

**Out of scope:**
- Changing PR title format
- Custom PR templates
- PR labeling or assignee logic
- Branch name customization beyond existing slugification

## Constraints

- **L02**: No `any` type
- **L03**: No type assertions except at validated system boundaries
- **L04**: Explicit return types on all public functions
- **L06**: Dependency injection required
- **L07**: Side effects behind injectable interfaces
- **L08**: Unit tests must not touch real systems
- **L09**: Test coverage of all conditional paths
- **Sandi Metz rules**: Classes/modules max 100 lines, functions max 5 lines
- **Discriminated unions** for state modeling
- **Kebab-case filenames**

## Acceptance criteria

1. `ServiceStatusDone` and `ServiceStatusBlocked` include optional `prUrl?: string` field
2. `ServiceStatusIdle`, `ServiceStatusDone`, and `ServiceStatusBlocked` include optional `gitBranch?: string` field
3. `GitOperations.openPR()` returns `GitResult<string>` where the value is the PR URL extracted from stdout
4. A new module `pr-description-builder.ts` reads phase directories to generate rich prose PR descriptions
5. `git-post-phase.ts` uses the rich description builder and stores PR URL in status
6. Git branch is captured at server startup and tracked through all status transitions
7. All affected tests pass with new behavior
8. Documentation in `.ushabti/docs/index.md` reflects updated JSON schema and PR description behavior
9. Package version is bumped to 0.1.10

## Risks / notes

- PR URL extraction depends on `gh` CLI output format remaining stable
- Rich PR descriptions require readable phase files; missing files should not block PR creation
- Git branch tracking at idle requires querying git at server startup
