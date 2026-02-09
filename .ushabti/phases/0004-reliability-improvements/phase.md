# Reliability Improvements: Logging, Dependencies, Status Verification, and Git

## Intent

Mature Pharaoh's reliability and developer experience through four targeted improvements that address operational gaps revealed during early usage.

1. **Debug log terminology** — The `turnCounter` variable and `turn` log field misrepresent what they count. They track assistant messages in the SDK stream, not actual API turns. Fix the terminology to accurately reflect what's being measured.

2. **Dependency resolution** — Eliminate manual `--plugin-path` configuration. Ushabti should be declared as an npm dependency and resolved automatically at runtime. This simplifies deployment and removes a source of configuration errors.

3. **Phase completion verification** — The SDK query can return success even if the ir-kat loop exits early. Add post-run status verification via `/phase-status latest` to detect incomplete phases and report them as blocked.

4. **Git integration** — Automate git workflows around phase execution: verify clean state and create feature branches before phases; stage, commit, and open PRs after green phases. This establishes reproducible development flow and clear phase boundaries.

These improvements are independent but share a common theme: reducing operational friction and increasing confidence in Pharaoh's correctness.

## Scope

### In Scope

**Debug log fix:**
- Rename `turnCounter` variable to `messageCounter` in `runner.ts`
- Change log field from `"turn"` to `"message"` in debug output
- Word "turn" only appears in phase completion logs (from SDK's `num_turns`)

**Ushabti as npm dependency:**
- Add minimal `package.json` to Ushabti repo at `/Users/adam/Development/ushabti/` with `"name": "ushabti"` and `"version": "1.8.0"`
- Add `"ushabti": "file:../ushabti"` to Pharaoh's `package.json` dependencies
- Resolve plugin path at runtime using `createRequire` + `require.resolve('ushabti/package.json')`
- Remove `--plugin-path` from CLI parsing, validation, types, and documentation
- Remove `pluginPath` from `RunnerConfig` interface
- Clear error message if Ushabti not installed: "ushabti not found — run npm install"
- Keep `--model` as optional CLI override
- Run `npm install` after modifying `package.json`

**Post-run status check:**
- After main SDK query returns in `runner.runPhase()`, make a second SDK query
- Second query invokes `/phase-status latest` using sonnet model and maxTurns of 5
- Parse response to extract phase status
- If status is `complete`, `reviewing`, or `done`: report success
- If status is anything else (`building`, `planned`, etc.): report as blocked with reason "phase loop incomplete — status: {actual}"
- Log both SDK outcome and phase status for diagnostics
- Status check needs same plugin (Ushabti), same cwd, cheaper model
- Fix timestamp bug: capture `phaseStarted` when phase begins, pass through to completion

**Git integration:**
- Create new `git.ts` module with `GitOperations` class
- Pre-phase operations: verify on main/master, clean working tree, pull, create branch `pharaoh/{phase-slug}`
- Post-phase operations (on green): stage all changes, commit with message, push branch, open PR via `gh` CLI if available
- Error handling: skip gracefully if not a git repo, no remote, no `gh` CLI installed
- Inject command existence checker for testability (allows mocking `git` and `gh` availability)

### Out of Scope

- **Tests** — Desirable but not blocking; can be added in a focused testing phase
- **Retry logic** — Failed phases stay blocked; operator retries manually
- **Configurable git branch naming** — Fixed pattern `pharaoh/{phase-slug}` is sufficient
- **Multiple plugin support** — Single plugin (Ushabti) hardcoded
- **Git hook integration** — No pre-commit or commit-msg hooks configured

## Constraints

From `.ushabti/laws.md`:
- **L02, L04**: No `any` type; explicit return types on all public functions
- **L06, L07**: All dependencies injectable; all side effects behind interfaces
- **L08**: Unit tests must not touch real systems (filesystem, SDK, git)
- **L15, L17**: Documentation must be reconciled with code changes

From `.ushabti/style.md`:
- **Sandi Metz rules**: 100-line modules, 5-line functions, max 4 parameters (use options objects)
- **Dependency injection**: All dependencies via constructor/method parameters
- **Interface abstractions**: All side effects behind injectable interfaces
- **Functional iteration**: Prefer `map`/`filter`/`reduce` over imperative loops
- **Kebab-case filenames**: `git.ts`, `git-operations.ts`, etc.

## Acceptance Criteria

- [ ] `npm run build` compiles with no TypeScript errors
- [ ] Debug log entries contain `"message":N`, not `"turn":N`
- [ ] The word "turn" only appears in phase completion logs where it comes from SDK's `num_turns`
- [ ] Variable is named `messageCounter`, not `turnCounter`
- [ ] Ushabti has a `package.json` with `"name": "ushabti"` and `"version": "1.8.0"` at `/Users/adam/Development/ushabti/package.json`
- [ ] Pharaoh's `package.json` lists `"ushabti": "file:../ushabti"` in dependencies
- [ ] `pharaoh serve` works with no `--plugin-path` argument
- [ ] `--plugin-path` flag does not exist in `cli.ts`, `index.ts`, or usage strings
- [ ] `pluginPath` does not exist in `RunnerConfig` interface
- [ ] Plugin path resolved from `node_modules` via `require.resolve('ushabti/package.json')`
- [ ] If Ushabti not installed, server fails with error: "ushabti not found — run npm install"
- [ ] After main phase execution, a second SDK query invokes `/phase-status latest`
- [ ] Second query uses sonnet model and maxTurns of 5
- [ ] If phase status is `complete`, `reviewing`, or `done`, result is success
- [ ] If phase status is `building` or `planned`, result is blocked with reason including actual status
- [ ] Phase start timestamp (`phaseStarted`) captured when phase begins, not when it completes
- [ ] Both SDK result and phase status logged for diagnostics
- [ ] New `git.ts` module exists with `GitOperations` class
- [ ] In a git repository with clean state: feature branch `pharaoh/{phase-slug}` created before phase
- [ ] After green phase completion: all changes staged, committed with descriptive message, pushed to remote
- [ ] If `gh` CLI available: PR opened automatically after push
- [ ] In non-git directories or with uncommitted changes: git operations skipped gracefully with log warnings
- [ ] Command existence checker injected into `GitOperations` for testability
- [ ] Documentation in `.ushabti/docs/index.md` updated to reflect removal of `--plugin-path` and addition of git integration

## Risks / Notes

**Cross-repo dependency**: Adding `package.json` to Ushabti must happen first, otherwise `npm install` in Pharaoh will fail. This is a manual prerequisite.

**Git workflow assumption**: Assumes developer wants automatic git operations. No opt-out mechanism provided. If this becomes a problem, add a `--no-git` CLI flag in a future phase.

**Phase status accuracy**: The `/phase-status latest` skill may return incomplete data if the phase directory or progress.yaml are malformed. This check detects early exits, not data corruption.

**PR creation dependency**: Requires `gh` CLI installed and authenticated. If unavailable, commit and push still succeed but PR creation is skipped.

**Timestamp bug**: The `phaseStarted` timestamp is currently captured during status write, not at phase start. This creates inaccurate duration calculations. Fix it by capturing timestamp in `runPhase()` and threading through.
