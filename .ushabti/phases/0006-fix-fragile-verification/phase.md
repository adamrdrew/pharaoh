# Fix Fragile Phase Verification

## Intent

Replace the agent-based phase verification system with direct filesystem reads. Currently `status-check.ts` spawns a Sonnet SDK query to run `/phase-status latest` after each phase completes. The Sonnet agent frequently rambles instead of producing the expected YAML output, causing Pharaoh to report phases as "blocked" when they actually completed successfully.

The problem: `executeStatusQuery()` spawns `query()` with Sonnet and the prompt "Run /phase-status latest — output only the PHASE_STATUS block, nothing else." The agent often fails to execute the skill cleanly. `extractPhaseStatus()` then can't find a `status: complete` line in the output and returns "unknown". `runner-verification.ts` treats "unknown" as blocked, creating false negatives.

The solution: Read the filesystem directly. Find the latest Ushabti phase directory by scanning `.ushabti/phases/` for the most recently modified directory, read `progress.yaml` from that directory, parse the `status` field from the YAML, and return it to the existing verification pipeline. No agent is needed to read a file.

## Scope

### In Scope

**Remove agent-based verification:**
- Delete the SDK `query()` import and agent invocation from `status-check.ts`
- Remove `pluginPath` parameter from `checkPhaseStatus()` function signature
- Remove agent-specific logic: `executeStatusQuery()`, `buildQueryOptions()`, `extractMessageContent()`

**Implement filesystem-based status check:**
- Add `Filesystem` parameter to `checkPhaseStatus()` function
- Find latest phase directory by scanning `.ushabti/phases/` and sorting by modification time
- Read `progress.yaml` from the latest phase directory
- Parse YAML to extract the `status` field from the `phase` section
- Return status string to existing verification pipeline in `runner-verification.ts`

**Thread dependency changes:**
- Update `verifyPhaseCompletion()` in `runner-verification.ts` to accept `Filesystem` instead of `pluginPath`
- Update call site in `runner.ts` to pass `filesystem` dependency instead of `pluginPath`
- Remove `pluginPath` parameter propagation through the verification chain

**YAML parsing:**
- Add `js-yaml` as a dependency in `package.json`
- Use `yaml.load()` to parse `progress.yaml` content
- Add runtime validation to ensure parsed data has expected structure
- Handle parsing errors gracefully with typed error results

**Error handling:**
- Return typed errors if `.ushabti/phases/` doesn't exist
- Return typed errors if no phase directories found
- Return typed errors if `progress.yaml` doesn't exist or can't be read
- Return typed errors if YAML parsing fails or status field is missing

### Out of Scope

- Tests — Desirable but not blocking; can be added in a focused testing phase
- Caching of phase status — Each verification reads from disk
- Alternative status sources — Only `progress.yaml` is consulted
- Status validation beyond presence check — Don't validate that status is a known value
- Changes to `runner-verification.ts` interpretation logic — Valid statuses remain `['complete', 'reviewing', 'done']`

## Constraints

From `.ushabti/laws.md`:
- **L02**: No `any` type allowed
- **L03**: No type assertions except at validated system boundaries with runtime validation
- **L04**: Explicit return types on all public functions
- **L06**: Dependency injection required — `Filesystem` injected into `checkPhaseStatus`
- **L07**: Side effects behind injectable interfaces — use injected `Filesystem`, not direct `fs` calls
- **L15, L17**: Documentation must be reconciled with code changes

From `.ushabti/style.md`:
- **Sandi Metz rules**: 100-line modules, 5-line functions, max 4 parameters
- **Kebab-case filenames**: Continue existing pattern
- **Typed Result values**: Return `StatusCheckResult` union for expected failures
- **No `console.log`**: Use structured logger
- **Dependency injection**: All dependencies via parameters

## Acceptance Criteria

- [ ] `npm run build` compiles with no TypeScript errors
- [ ] `npm test` passes (existing tests may need updates for signature changes)
- [ ] `js-yaml` added to `package.json` dependencies
- [ ] SDK `query()` import removed from `status-check.ts`
- [ ] `pluginPath` parameter removed from `checkPhaseStatus()` signature
- [ ] `Filesystem` parameter added to `checkPhaseStatus()` signature
- [ ] `checkPhaseStatus()` scans `.ushabti/phases/` for directories
- [ ] Latest phase directory identified by most recent modification time
- [ ] `progress.yaml` read from latest phase directory
- [ ] YAML parsed to extract `status` field from `phase` section
- [ ] Status string returned in `StatusCheckResult` on success
- [ ] Typed errors returned if phases directory doesn't exist
- [ ] Typed errors returned if no phase directories found
- [ ] Typed errors returned if `progress.yaml` missing or unreadable
- [ ] Typed errors returned if YAML parsing fails
- [ ] `verifyPhaseCompletion()` in `runner-verification.ts` accepts `Filesystem` instead of `pluginPath`
- [ ] Call site in `runner.ts` updated to pass `filesystem` instead of `pluginPath`
- [ ] All agent-specific helper functions removed from `status-check.ts`
- [ ] Runtime validation ensures parsed YAML has expected structure before accessing `status` field
- [ ] Documentation in `.ushabti/docs/index.md` updated to remove reference to agent-based verification and describe filesystem-based approach

## Risks / Notes

**YAML dependency**: Adds `js-yaml` as a runtime dependency. This is acceptable — YAML parsing is a common need and `js-yaml` is well-maintained.

**Modification time reliability**: Finding the latest phase by modification time assumes the filesystem accurately tracks mtime. This is true on all modern filesystems but could theoretically fail if mtime is manually manipulated. Acceptable risk.

**Status field validation**: The implementation doesn't validate that the status field contains a known value (like "complete" or "building"). That validation remains in `runner-verification.ts`. This separation of concerns is intentional.

**No fallback to agent**: If the filesystem read fails, there's no fallback to the agent-based approach. This is intentional — the agent approach is unreliable, so removing it entirely forces us to fix any filesystem read issues.

**Breaking change for tests**: Existing tests that mock `checkPhaseStatus()` will need updates for the new signature. This is acceptable churn for a reliability fix.

**Phase directory naming assumption**: Assumes phase directories follow the pattern `NNNN-slug` where `NNNN` is a zero-padded number. This is enforced by Ushabti conventions and documented in the framework.
