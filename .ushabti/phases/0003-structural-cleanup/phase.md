# Structural Cleanup

card: phase-completion-observability

## Intent

Reorganize Pharaoh's filesystem layout and eliminate code quality issues from phase 1. Pharaoh's state files are currently co-mingled with Ushabti's under `.ushabti/`, which creates namespace pollution and violates separation of concerns. They must move to Pharaoh's own `.pharaoh/` directory. The logger has a read-modify-write scaling bug that will fail on large logs. The codebase has Sandi Metz violations (>4 parameter methods) that need cleanup. CLI configuration is hardcoded to machine-specific paths.

This phase cleans up technical debt while preparing for future observability work.

## Scope

### In Scope

- Move all Pharaoh state files from `.ushabti/` to `.pharaoh/`
- Rename `service.json` → `pharaoh.json` and `service.log` → `pharaoh.log`
- Add `appendFile()` to Filesystem interface and fix Logger to use append-only writes
- Remove or improve noisy "Assistant message received" debug logs in runner
- Add CLI arguments for `--plugin-path` and `--model` to replace hardcoded values
- Refactor StatusManager methods to accept typed objects instead of 7+ positional parameters
- Update documentation to reflect new file layout

### Out of Scope

- Phase completion verification (depends on Ushabti's phase-status skill)
- Git integration
- Adding tests for existing functionality (deferred from phase 1)
- Any behavioral changes beyond the above refactors

## Constraints

### Laws

- **L02**: No `any` type, including implicit `any`
- **L03**: No type assertions except at validated system boundaries
- **L04**: Explicit return types on all public functions
- **L06**: Dependency injection required, no direct instantiation
- **L07**: All side effects behind injectable interfaces
- **L15, L17**: Documentation must be reconciled before phase completion

### Style

- **Sandi Metz**: Max 4 parameters per function (use options objects)
- **Sandi Metz**: Max 5 lines per function, 100 lines per module
- Kebab-case filenames, `const` by default, `readonly` on properties
- Discriminated unions for state, exhaustive `never` switches
- No `console.log` in production code

## Acceptance Criteria

- [ ] `npm run build` compiles with no errors
- [ ] All Pharaoh state files live under `.pharaoh/`, nothing under `.ushabti/`
- [ ] `pharaoh serve --plugin-path /path/to/ushabti` starts successfully
- [ ] `pharaoh serve` without `--plugin-path` shows usage error and exits with code 1
- [ ] File names are `pharaoh.json` and `pharaoh.log`, not `service.*`
- [ ] Logger uses `appendFile()` and never reads the log file during normal operation
- [ ] No identical "Assistant message received" spam in logs (either removed or includes turn counter)
- [ ] Phase completion log includes `turns` used and `maxTurns`
- [ ] No StatusManager method has more than 4 parameters
- [ ] No hardcoded machine-specific paths remain in source
- [ ] Grep for `.ushabti/` in source returns zero hits except Ushabti plugin path references
- [ ] `.ushabti/docs/index.md` updated to reflect new file names and paths
- [ ] `.pharaoh/` and `.pharaoh/dispatch/` are created on startup if they don't exist
- [ ] Shutdown removes `pharaoh.json`, not `service.json`

## Risks / Notes

- **Breaking change**: Existing Pharaoh deployments will need to migrate state files from `.ushabti/` to `.pharaoh/`. Since this is pre-1.0.0 and the project is in active development, this is acceptable.
- **Logger change**: The logger currently reads the entire log file on every write, which is O(n²) for n writes. This works for small logs but will fail on large ones. Switching to append-only writes fixes this.
- **CLI args**: Making `--plugin-path` required ensures users can't accidentally run with hardcoded paths. The optional `--model` arg provides flexibility without breaking existing workflows.
