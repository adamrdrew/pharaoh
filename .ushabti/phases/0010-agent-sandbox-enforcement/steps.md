# Steps

## S001: Thread `config` into `createHookOptions`

**Intent:** Make `config.cwd` available to the hook function.

**Work:**
- Change `createHookOptions` signature to accept `config: RunnerConfig` parameter
- Update `buildQueryOptions` to pass `config` to `createHookOptions`
- Build `allowedPaths` array inside `createHookOptions`: `[config.cwd]`
- Pass `allowedPaths` to `createBlockHook` as a parameter

**Done when:** `createBlockHook` receives `allowedPaths: string[]` containing `config.cwd`.

## S002: Block `dangerouslyDisableSandbox` in hook

**Intent:** Prevent the agent from disabling the Bash sandbox.

**Work:**
- In `createBlockHook`, cast `input` to typed shape with `tool_name` and `tool_input` fields
- Before the existing `AskUserQuestion` check, add conditional for `tool_name === 'Bash'` and `tool_input.dangerouslyDisableSandbox === true`
- Return block decision with reason: `"dangerouslyDisableSandbox is not permitted. Fix the underlying issue instead of disabling the sandbox."`
- Log the blocked attempt via `logger.info`

**Done when:** Bash tool calls with `dangerouslyDisableSandbox: true` are blocked and logged.

## S003: Extract path validation helper

**Intent:** Provide reusable path validation logic.

**Work:**
- Create `isPathAllowed(targetPath: string, allowedPaths: string[]): boolean` function
- Use `path.resolve()` to normalize both `targetPath` and each entry in `allowedPaths`
- Return `true` if normalized `targetPath` starts with any normalized allowed path
- Import `path` from `node:path` at top of file

**Done when:** `isPathAllowed` function exists with explicit return type.

## S004: Validate paths on Read, Write, Edit tools

**Intent:** Block filesystem reads/writes outside `config.cwd`.

**Work:**
- In `createBlockHook`, after sandbox check, add conditionals for `Read`, `Write`, `Edit` tools
- Extract `tool_input.file_path` for each tool
- Call `isPathAllowed(file_path, allowedPaths)`
- If validation fails, return block decision with reason: `"Path \"{file_path}\" is outside the permitted directories. Allowed: {allowedPaths.join(', ')}"`

**Done when:** Read, Write, Edit tools with external `file_path` values are blocked.

## S005: Validate paths on Glob, Grep tools

**Intent:** Block pattern searches outside `config.cwd`.

**Work:**
- In `createBlockHook`, add conditionals for `Glob` and `Grep` tools
- Extract `tool_input.path` (optional field)
- If `path` field is present, call `isPathAllowed(path, allowedPaths)` and block if validation fails
- If `path` field is absent, allow (defaults to cwd)

**Done when:** Glob and Grep tools with external `path` values are blocked; tools without `path` field are allowed.

## S006: Write tests for sandbox flag blocking

**Intent:** Verify `dangerouslyDisableSandbox` is rejected.

**Work:**
- Create test file `tests/runner-query.test.ts`
- Import `createQuery` and necessary types
- Test: "blocks Bash with dangerouslyDisableSandbox" — Invoke hook with `{ tool_name: 'Bash', tool_input: { command: 'swift build', dangerouslyDisableSandbox: true } }`, assert `decision: 'block'`
- Test: "allows Bash without dangerouslyDisableSandbox" — Invoke hook with `{ tool_name: 'Bash', tool_input: { command: 'swift build' } }`, assert `{ continue: true }`

**Done when:** Tests pass and cover both blocking and allowing Bash calls.

## S007: Write tests for path validation

**Intent:** Verify filesystem tools respect path boundaries.

**Work:**
- Test: "blocks Read outside cwd" — Hook input with `{ tool_name: 'Read', tool_input: { file_path: '/Users/adam/Photos/test.jpg' } }`, assert blocked
- Test: "allows Read inside cwd" — Hook input with `{ tool_name: 'Read', tool_input: { file_path: '/Users/adam/Development/pharoh/src/index.ts' } }` where cwd is `/Users/adam/Development/pharoh`, assert allowed
- Test: "blocks path traversal" — Hook input with `{ tool_name: 'Read', tool_input: { file_path: '/Users/adam/Development/pharoh/../../Photos/test.jpg' } }`, assert blocked (resolves to `/Users/adam/Photos/test.jpg`)
- Test: "allows Glob without path field" — Hook input with `{ tool_name: 'Glob', tool_input: { pattern: '**/*.ts' } }`, assert allowed
- Test: "blocks Glob with external path" — Hook input with `{ tool_name: 'Glob', tool_input: { pattern: '*.jpg', path: '/Users/adam/Photos' } }`, assert blocked

**Done when:** All path validation tests pass.

## S008: Write tests for Write and Edit tools

**Intent:** Verify Write and Edit respect path boundaries.

**Work:**
- Test: "blocks Write outside cwd" — Hook input with `{ tool_name: 'Write', tool_input: { file_path: '/etc/passwd', content: 'bad' } }`, assert blocked
- Test: "allows Write inside cwd" — Hook input with `{ tool_name: 'Write', tool_input: { file_path: '/Users/adam/Development/pharoh/output.txt', content: 'good' } }` where cwd is `/Users/adam/Development/pharoh`, assert allowed
- Test: "blocks Edit outside cwd" — Hook input with `{ tool_name: 'Edit', tool_input: { file_path: '/usr/bin/something', old_string: 'a', new_string: 'b' } }`, assert blocked
- Test: "allows Edit inside cwd" — Hook input with `{ tool_name: 'Edit', tool_input: { file_path: '/Users/adam/Development/pharoh/src/runner.ts', old_string: 'a', new_string: 'b' } }` where cwd is `/Users/adam/Development/pharoh`, assert allowed

**Done when:** All Write and Edit path validation tests pass.

## S009: Verify AskUserQuestion still blocked

**Intent:** Confirm existing hook behavior unchanged.

**Work:**
- Test: "blocks AskUserQuestion" — Hook input with `{ hook_event_name: 'PreToolUse', tool_name: 'AskUserQuestion', tool_input: { question: 'Proceed?' } }`, assert blocked with `systemMessage: 'Proceed with your best judgement'`

**Done when:** AskUserQuestion blocking test passes.

## S010: Run all tests and confirm no regressions

**Intent:** Verify entire test suite passes.

**Work:**
- Run `npm test`
- Verify all existing tests still pass
- Verify new tests in `tests/runner-query.test.ts` pass

**Done when:** `npm test` exits with code 0, all tests green.

## S011: Split runner-query.ts to respect 100-line limit

**Intent:** Enforce Sandi Metz 100-line module constraint.

**Work:**
- Extract path validation logic (lines 46-70) to new module `runner-path-validation.ts`
- Extract hook handlers (lines 72-104) to new module `runner-hook-handlers.ts`
- Update `runner-query.ts` imports to reference new modules
- Verify all functions maintain explicit return types
- Verify all tests still pass after refactor

**Done when:** `runner-query.ts` is under 100 lines, all tests pass, no functionality changed.

## S012: Document sandbox enforcement in .ushabti/docs/index.md

**Intent:** Reconcile documentation with new security features.

**Work:**
- Add "Agent Sandbox Enforcement" subsection under "SDK Configuration" in `.ushabti/docs/index.md`
- Document that `dangerouslyDisableSandbox` is blocked on Bash tool calls
- Document that filesystem tools (Read, Write, Edit, Glob, Grep) validate paths against `config.cwd`
- Document that path traversal attempts (`../`) are blocked via `path.resolve()` normalization
- Document that optional path fields (Glob, Grep) default to cwd when absent

**Done when:** SDK Configuration section includes complete description of sandbox enforcement hooks.
