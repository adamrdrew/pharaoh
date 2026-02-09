# Implementation Steps

## S001: Define event types and schema

**Intent**: Establish the type system for events before implementing writers or builders.

**Work**:
- Create `event-writer.ts` with `PharaohEvent` interface
- Define fields: `timestamp: string`, `type: string`, `agent?: string`, `summary: string`, `detail?: Record<string, unknown>`
- Export event type discriminators: `'tool_call' | 'tool_progress' | 'tool_summary' | 'text' | 'turn' | 'status' | 'result' | 'error'`
- Add JSDoc describing each field's purpose

**Done when**:
- `PharaohEvent` interface exists with all required fields
- Event type union exported
- `npm run build` succeeds with no errors

## S002: Implement EventWriter class

**Intent**: Create the infrastructure for writing events to the filesystem.

**Work**:
- In `event-writer.ts`, create `EventWriter` class
- Constructor takes `Filesystem` interface and `eventsPath: string`
- Implement `write(event: PharaohEvent): Promise<void>` — serializes event to JSON and appends to file with newline
- Implement `clear(): Promise<void>` — truncates the events file (writes empty string)
- Follow dependency injection pattern (L06)

**Done when**:
- `EventWriter` class exists with `write()` and `clear()` methods
- Both methods have explicit return types
- Uses injected `Filesystem` interface for I/O
- `npm run build` succeeds

## S003: Add events file path to server-paths

**Intent**: Define the canonical path for the events file alongside other Pharaoh state files.

**Work**:
- Edit `server-paths.ts`
- Add `eventsPath` constant: `path.join(cwd, '.pharaoh', 'events.jsonl')`
- Export `eventsPath` from the module
- Follow existing pattern for `statusPath` and `logPath`

**Done when**:
- `eventsPath` exported from `server-paths.ts`
- Path points to `.pharaoh/events.jsonl`
- `npm run build` succeeds

## S004: Create event builders for SDK messages

**Intent**: Transform raw SDK messages into normalized `PharaohEvent` objects.

**Work**:
- Create `event-builders.ts` module
- Implement builder functions:
  - `buildAssistantToolCallEvent(message)` — extracts tool use blocks, truncates input to 500 chars
  - `buildAssistantTextEvent(message)` — extracts text blocks, truncates to 200 chars for summary
  - `buildAssistantTurnEvent(message, turnNumber)` — extracts token usage from message.usage
  - `buildToolProgressEvent(message)` — formats elapsed time
  - `buildToolSummaryEvent(message)` — uses summary string directly
  - `buildSystemInitEvent(message)` — extracts model/tools/plugins if available
  - `buildSystemStatusEvent(message)` — extracts status string
  - `buildResultEvent(message)` — extracts turns, cost, duration
  - `buildErrorEvent(message)` — extracts errors array
- Each builder returns `PharaohEvent` with current timestamp (ISO8601)

**Done when**:
- All builder functions exist with explicit return types
- Truncation logic implemented (500 chars for tool input, 200 for text)
- Timestamp generation uses `new Date().toISOString()`
- All functions under 5 lines (extract helpers if needed)
- `npm run build` succeeds

## S005: Wire EventWriter into PhaseRunner

**Intent**: Make event writer available to the runner via dependency injection.

**Work**:
- Edit `runner.ts` — add `private readonly eventWriter: EventWriter` to `PhaseRunner`
- Update constructor to accept `eventWriter` parameter (may need options object to stay under 4 params)
- Import `EventWriter` type
- Update `server-deps.ts` to instantiate `EventWriter` and pass to `PhaseRunner`

**Done when**:
- `PhaseRunner` has `eventWriter` as private readonly property
- Constructor parameter count is 4 or fewer (use options object if needed)
- `EventWriter` instantiated in `server-deps.ts` with `Filesystem` and `eventsPath`
- `npm run build` succeeds

## S006: Clear events file at phase start

**Intent**: Truncate events file when a new phase begins.

**Work**:
- Edit `runner.ts` in `initializePhase()` method
- Call `await this.eventWriter.clear()` before logging phase start
- Ensure function stays under 5 lines

**Done when**:
- `initializePhase()` calls `eventWriter.clear()`
- Events file truncated at start of each phase
- `npm run build` succeeds

## S007: Capture assistant message events

**Intent**: Write turn and tool call events for assistant messages.

**Work**:
- Edit `runner-messages.ts` or create new handler in runner
- After processing assistant message, check message content array
- For each `tool_use` block: call `buildAssistantToolCallEvent()` and write event
- For each `text` block: call `buildAssistantTextEvent()` and write event
- Call `buildAssistantTurnEvent()` with turn number and write event
- Pass `EventWriter` to handler functions via dependency injection

**Done when**:
- Tool call events written for assistant messages with tool_use blocks
- Text events written for assistant messages with text blocks
- Turn events written for all assistant messages
- Events written via `eventWriter.write()`
- `npm run build` succeeds

## S008: Capture tool progress events with debouncing

**Intent**: Write tool progress events while avoiding excessive I/O from frequent progress updates.

**Work**:
- Create `event-debouncer.ts` module with `ProgressDebouncer` class
- Track last write time per `tool_use_id` in a Map
- Implement `shouldWrite(toolUseId: string): boolean` — returns true if >5 seconds since last write
- Update last write time when `shouldWrite` returns true
- In runner, capture `tool_progress` messages and call debouncer before writing

**Done when**:
- `ProgressDebouncer` class exists with `shouldWrite()` method
- Debouncing limits progress events to max once per 5 seconds per tool
- Tool progress events written via `eventWriter.write()`
- `npm run build` succeeds

## S009: Capture tool summary events

**Intent**: Write summary events after tool execution completes.

**Work**:
- In runner message handling, detect `tool_use_summary` messages
- Call `buildToolSummaryEvent()` with message
- Write event via `eventWriter.write()`

**Done when**:
- Tool summary events written for `tool_use_summary` messages
- Summary string and tool use IDs included in event
- `npm run build` succeeds

## S010: Capture system and result events

**Intent**: Write status, initialization, and completion events.

**Work**:
- Detect `system` messages with `subtype: 'init'` — call `buildSystemInitEvent()`
- Detect `system` messages with `subtype: 'status'` — call `buildSystemStatusEvent()`
- Detect `result` messages — call `buildResultEvent()` for success or `buildErrorEvent()` for failure
- Write events via `eventWriter.write()`

**Done when**:
- System init events written on SDK initialization
- System status events written on status updates
- Result events written on phase completion
- Error events written on phase failure
- `npm run build` succeeds

## S011: Add enriched fields to ServiceStatusBusy

**Intent**: Extend busy status type with running metrics.

**Work**:
- Edit `types.ts` — add `readonly turnsElapsed: number` and `readonly runningCostUsd: number` to `ServiceStatusBusy` interface
- Add JSDoc describing fields: turns elapsed is assistant message count, running cost is accumulated from token usage

**Done when**:
- `ServiceStatusBusy` has new fields
- Fields are `readonly`
- `npm run build` succeeds (may have errors in dependent code, fixed in next step)

## S012: Add enriched fields to SetBusyInput

**Intent**: Allow status manager to receive updated metrics.

**Work**:
- Edit `status-inputs.ts` — add `readonly turnsElapsed: number` and `readonly runningCostUsd: number` to `SetBusyInput` interface
- Fields match `ServiceStatusBusy` exactly

**Done when**:
- `SetBusyInput` has new fields
- Fields are `readonly`
- Type errors from S011 resolved
- `npm run build` succeeds

## S013: Implement running cost calculation

**Intent**: Estimate cost from token usage with Opus 4 pricing heuristic.

**Work**:
- Create `cost-calculator.ts` module
- Implement `calculateRunningCost(inputTokens: number, outputTokens: number): number`
- Use formula: `(inputTokens * 0.015 + outputTokens * 0.075) / 1_000_000`
- Return cost in USD rounded to 6 decimal places
- Add JSDoc noting this is a heuristic for Opus 4 pricing

**Done when**:
- `calculateRunningCost()` function exists with explicit return type
- Calculation matches Opus 4 pricing ($15/MTok input, $75/MTok output)
- Function is pure (no side effects)
- `npm run build` succeeds

## S014: Track running metrics in runner state

**Intent**: Accumulate turn count and cost as assistant messages arrive.

**Work**:
- Edit `runner.ts` in `updateState()` method
- Add `inputTokens` and `outputTokens` to state object
- When processing assistant message, extract `message.usage.input_tokens` and `message.usage.output_tokens`
- Accumulate token counts
- Calculate running cost using `calculateRunningCost()`
- Update `state.turns` to be assistant message counter (not SDK num_turns)

**Done when**:
- State object tracks `inputTokens`, `outputTokens`, `turnsElapsed`, `runningCostUsd`
- Token counts accumulated from assistant message usage
- Running cost updated using calculator
- `npm run build` succeeds

## S015: Update status with running metrics

**Intent**: Write enriched status to disk after each assistant message.

**Work**:
- Create `status-throttler.ts` module with `StatusThrottler` class
- Track last status write time
- Implement `shouldWrite(): boolean` — returns true if >5 seconds since last write
- In runner, after processing assistant message, check throttler
- If throttler allows, call `status.setBusy()` with updated `turnsElapsed` and `runningCostUsd`

**Done when**:
- `StatusThrottler` class exists with `shouldWrite()` method
- Status writes throttled to max once per 5 seconds
- `setBusy()` receives current turn count and running cost
- `npm run build` succeeds

## S016: Initialize enriched fields on first setBusy call

**Intent**: Ensure new fields have valid initial values when phase starts.

**Work**:
- Edit `runner.ts` in `initializePhase()`
- Update `setBusy()` call to include `turnsElapsed: 0` and `runningCostUsd: 0`
- Verify status-setters.ts handles new fields correctly

**Done when**:
- Initial `setBusy()` call includes enriched fields set to zero
- `pharaoh.json` written with all required fields
- `npm run build` succeeds

## S017: Update documentation for events file

**Intent**: Reconcile docs with new events.jsonl output.

**Work**:
- Edit `.ushabti/docs/index.md`
- Add section "Event Stream" describing `.pharaoh/events.jsonl`
- Document JSON Lines format, event schema, event types
- Note events are cleared on each phase start
- Note events are append-only during execution
- Example event JSON for each type

**Done when**:
- Documentation describes events file format and purpose
- Event schema documented with field descriptions
- Event types table included
- Example JSON shown
- No stale references remain

## S018: Update documentation for enriched status

**Intent**: Reconcile docs with new ServiceStatusBusy fields.

**Work**:
- Edit `.ushabti/docs/index.md` in "Status File Schema" section
- Update `ServiceStatusBusy` example JSON to include `turnsElapsed` and `runningCostUsd`
- Document field meanings: turns elapsed is assistant message count, running cost is heuristic based on token usage
- Note final cost from result message is authoritative

**Done when**:
- Busy status example includes new fields
- Field descriptions added to documentation
- Note about cost accuracy included
- No stale references remain

## S019: Decompose event-builders.ts to respect 100-line limit

**Intent**: Split event-builders.ts (currently 125 lines) into multiple focused modules.

**Work**:
- Create `event-builders-assistant.ts` for assistant message events (tool_call, text, turn)
- Create `event-builders-tool.ts` for tool events (progress, summary)
- Create `event-builders-system.ts` for system and result events (init, status, result, error)
- Move shared utilities (truncate, timestamp) to `event-builders-utils.ts`
- Update imports in `runner-events.ts` to reference new module locations
- Ensure each module is under 100 lines

**Done when**:
- `event-builders.ts` removed or reduced to re-exports only
- All builder functions moved to appropriate focused modules
- Each new module under 100 lines
- All imports updated
- `npm run build` succeeds

## S020: Decompose runner-events.ts to respect 100-line limit

**Intent**: Split runner-events.ts (currently 162 lines) into multiple focused modules.

**Work**:
- Create `runner-events-assistant.ts` for assistant event capture functions
- Create `runner-events-tool.ts` for tool event capture functions
- Create `runner-events-system.ts` for system and result event capture functions
- Update imports in `runner.ts` to reference new module locations
- Ensure each module is under 100 lines

**Done when**:
- `runner-events.ts` removed or reduced to re-exports only
- All capture functions moved to appropriate focused modules
- Each new module under 100 lines
- All imports updated
- `npm run build` succeeds

## S021: Decompose runner.ts to respect 100-line limit

**Intent**: Split runner.ts (currently 181 lines) into multiple focused modules.

**Work**:
- Create `runner-state.ts` with `RunnerState` interface and state update functions
- Create `runner-routing.ts` with message routing/dispatch logic
- Reduce `runner.ts` to orchestration only (constructor, runPhase, initializePhase, processQueryMessages)
- Move updateState, updateAssistantMetrics, accumulateTokens, updateResultMetrics to `runner-state.ts`
- Move handleMessage, handleResultMessageWithEvents, handleNonResultMessage, etc. to `runner-routing.ts`
- Update imports and ensure dependency injection maintained

**Done when**:
- `runner.ts` under 100 lines
- State management in separate module
- Message routing in separate module
- Dependency injection preserved
- `npm run build` succeeds

## S022: Add runtime validation for SDK message type assertions

**Intent**: Replace type assertions in runner with validated type narrowing per L03.

**Work**:
- Create `runner-guards.ts` with type guard functions:
  - `isAssistantMessage(msg: unknown): msg is AssistantMessage`
  - `isResultMessage(msg: unknown): msg is ResultMessage`
  - `isSystemMessage(msg: unknown): msg is SystemMessage`
  - `isToolProgressMessage(msg: unknown): msg is ToolProgressMessage`
  - `isToolSummaryMessage(msg: unknown): msg is ToolSummaryMessage`
- Each guard performs runtime validation of message shape
- Replace type assertions in runner.ts, runner-routing.ts, runner-state.ts with guard calls
- Handle validation failures gracefully (log warning, skip message)

**Done when**:
- Type guard functions exist with runtime checks
- All `as` assertions in runner modules replaced with guards
- Invalid messages logged and handled safely
- L03 compliance verified
- `npm run build` succeeds

## S023: Add comprehensive test coverage for new modules

**Intent**: Add tests for all new modules to achieve L09 compliance.

**Work**:
- Create `tests/event-writer.test.ts` — test write(), clear(), JSON Lines format
- Create `tests/event-builders-assistant.test.ts` — test all assistant event builders
- Create `tests/event-builders-tool.test.ts` — test all tool event builders
- Create `tests/event-builders-system.test.ts` — test all system event builders
- Create `tests/event-debouncer.test.ts` — test debouncing logic, edge cases
- Create `tests/status-throttler.test.ts` — test throttling logic
- Create `tests/cost-calculator.test.ts` — test cost calculation with known token counts
- Create `tests/runner-events-assistant.test.ts` — test assistant event capture
- Create `tests/runner-events-tool.test.ts` — test tool event capture
- Create `tests/runner-events-system.test.ts` — test system event capture
- Create `tests/runner-guards.test.ts` — test all type guards with valid/invalid inputs
- Use `FakeFilesystem` for all I/O testing (L08)
- Cover all public methods, all branches, error conditions (L09)

**Done when**:
- Test file exists for every new module
- All public methods have tests
- All conditional branches covered
- Error conditions tested
- No real I/O in tests (FakeFilesystem only)
- `npm test` passes with all new tests
- L09 compliance verified
