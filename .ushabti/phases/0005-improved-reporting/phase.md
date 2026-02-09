# Improved Reporting: Event Capture and Enriched Status

## Intent

Pharaoh currently discards rich message events the Agent SDK yields during query execution. The runner iterates over SDK messages but only handles `result`, `assistant` (incrementing a counter), and `system` status messages. Tool calls, tool progress, summaries, text output, and per-turn usage are silently ignored.

This phase adds two capabilities:

1. **Structured event capture** — Write SDK message events to `.pharaoh/events.jsonl` as they arrive, enabling external consumers (like Hieroglyphs) to display a real-time agent activity stream.

2. **Enriched busy status** — Update `pharaoh.json` during execution with running turn count and accumulated cost, providing meaningful progress data while a phase runs.

These changes expose runtime visibility into phase execution without changing Pharaoh's core workflow or requiring upstream changes to the SDK.

## Scope

### In Scope

**Event file infrastructure:**
- New `EventWriter` class in `event-writer.ts` — takes `Filesystem` interface, provides `write(event)` and `clear()` methods
- Event file path `.pharaoh/events.jsonl` added to `server-paths.ts`
- JSON Lines format: one JSON object per line, newline-delimited
- Append-only writes using `fs.appendFile`
- File truncated at start of each phase

**Event schema and builders:**
- `PharaohEvent` type with fields: `timestamp`, `type`, `agent?`, `summary`, `detail?`
- Event builder functions in `event-builders.ts` — one function per SDK message type
- Event types: `tool_call`, `tool_progress`, `tool_summary`, `text`, `turn`, `status`, `result`, `error`
- Mapping from SDK message types to event types as specified in PHASE_PROMPT table
- Truncation rules: tool inputs to 500 chars, text blocks to 200 chars in summary

**Runner integration:**
- Wire `EventWriter` into `PhaseRunner` constructor (dependency injection)
- Call `eventWriter.clear()` in `initializePhase()`
- Call event builders and write events in `processMessage()` or new handler methods
- Don't capture `user` messages (synthetic tool results)
- Debounce `tool_progress` events: max once per 5 seconds per `tool_use_id`

**Enriched status fields:**
- Add `turnsElapsed: number` and `runningCostUsd: number` to `ServiceStatusBusy` in `types.ts`
- Add same fields to `SetBusyInput` in `status-inputs.ts`
- Update `setBusy()` calls after each assistant message with current turn count and cost
- Throttle status writes: max once per 5 seconds during execution

**Token-based cost estimation:**
- Track `inputTokens` and `outputTokens` from `assistant` message usage
- Use simple heuristic for cost: `(inputTokens * $0.015 + outputTokens * $0.075) / 1_000_000` (Opus 4 pricing)
- Accumulate running cost throughout execution
- Final `total_cost_usd` from result message remains authoritative

### Out of Scope

- Agent name detection — `agent` field in events is optional, can be populated later if SDK provides it
- Real-time event streaming protocol — events are file-based, consumers poll
- Historical event retention — events cleared on each phase start
- Hieroglyphs integration — that project will be updated separately to consume events
- Changes to `pharaoh.log` format or content
- Backward compatibility layer — new status fields are additive, old consumers ignore them
- Tests — Desirable but not blocking, can be added in focused testing phase

## Constraints

From `.ushabti/laws.md`:
- **L02**: No `any` type allowed
- **L03**: No type assertions except at validated system boundaries
- **L04**: Explicit return types on all public functions
- **L06**: Dependency injection required — `EventWriter` injected into `PhaseRunner`
- **L07**: Side effects behind injectable interfaces — `EventWriter` uses `Filesystem` interface
- **L15, L17**: Documentation must be reconciled with code changes

From `.ushabti/style.md`:
- **Sandi Metz rules**: 100-line modules, 5-line functions, max 4 parameters (use options objects)
- **Kebab-case filenames**: `event-writer.ts`, `event-builders.ts`
- **Discriminated unions**: Use for event type modeling
- **Functional iteration**: Prefer `map`/`filter`/`reduce`
- **No `console.log`**: Use structured logger

## Acceptance Criteria

- [ ] `npm run build` compiles with no TypeScript errors
- [ ] `EventWriter` class exists in `event-writer.ts` with `write(event)` and `clear()` methods
- [ ] `EventWriter` takes `Filesystem` interface in constructor
- [ ] `PharaohEvent` type defined with required fields: `timestamp`, `type`, `summary`
- [ ] Event builder functions exist in `event-builders.ts` for: `assistant`, `tool_progress`, `tool_use_summary`, `system`, `result`
- [ ] `.pharaoh/events.jsonl` path constant added to `server-paths.ts`
- [ ] Events file cleared at start of each phase in `initializePhase()`
- [ ] Events written after processing SDK messages in runner
- [ ] Tool inputs truncated to 500 characters in `detail` field
- [ ] Text blocks truncated to 200 characters in `summary` field
- [ ] `tool_progress` events debounced to max once per 5 seconds per `tool_use_id`
- [ ] `user` messages not captured
- [ ] `turnsElapsed` and `runningCostUsd` fields added to `ServiceStatusBusy` in `types.ts`
- [ ] Same fields added to `SetBusyInput` in `status-inputs.ts`
- [ ] `setBusy()` called with updated metrics after each assistant message
- [ ] Status writes throttled to max once per 5 seconds during execution
- [ ] Running cost calculated from token usage with Opus 4 pricing heuristic
- [ ] All modules under 100 lines
- [ ] All functions under 5 lines (or documented exception)
- [ ] Documentation in `.ushabti/docs/index.md` updated to describe events file and enriched status fields

## Risks / Notes

**Cost accuracy**: The running cost calculation is a heuristic based on Opus 4 pricing. It may be inaccurate for other models or future pricing changes. The final `total_cost_usd` from the SDK result message remains the authoritative cost.

**File I/O overhead**: Writing events on every SDK message adds I/O overhead. Append-only writes are fast, but frequent writes during high-message-rate phases may cause slight performance degradation. This is acceptable for the visibility gain.

**Event file size**: Long phases with many tool calls can produce large event files. No rotation or size limit is implemented. This is acceptable because events are cleared on each phase start.

**Throttling complexity**: Both `tool_progress` debouncing and status write throttling add stateful timestamp tracking. Keep this simple with basic `lastWriteTime` maps.

**Backwards compatibility**: New status fields are additive. Existing consumers that only read `status`, `pid`, `started`, `phase`, and `phaseStarted` will continue to work. This is intentional.

**Agent name extraction**: The `agent` field in events is optional and currently unpopulated. Future enhancement could parse agent names from SDK message context or system messages.
