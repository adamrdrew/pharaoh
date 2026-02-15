# Phase 0011: Test Phase

## Intent

Add a log level filter capability to the structured logger to support future observability improvements. This is a minimal, non-breaking enhancement that extends the logging infrastructure without changing existing behavior. This phase serves as a test of the Ushabti planning and creation workflow.

## Scope

**In scope:**
- Add log level types and configuration interface to log.ts
- Implement log level filtering in RealLogger
- Add tests covering all log level filtering scenarios
- Update documentation to reflect new logger capability

**Out of scope:**
- Changing existing log call sites
- Adding new log levels beyond the existing four (debug, info, warn, error)
- External log aggregation or structured output formats
- Performance optimization of logging (current implementation is sufficient)

## Constraints

This Phase is constrained by the following laws and style conventions:

### Laws
- L01: TypeScript strict mode required (already enabled in tsconfig.json)
- L02: No any type anywhere in the implementation
- L04: Explicit return types on all public functions
- L06: Dependencies must be injected (logger configuration injected via constructor)
- L08: Unit tests must not touch real filesystem (use fake filesystem for log file tests)
- L09: All conditional paths must be tested (all log levels, filter enabled/disabled)
- L15-L17: Documentation must be reconciled before phase completion

### Style
- Discriminated unions: Use discriminated union for log level if appropriate
- Sandi Metz rules: Max 100 lines per module, max 5 lines per function
- Kebab-case filenames: Already established in log.ts
- Typed results: If logger initialization can fail, return Result type
- Functional iteration: Use map/filter for processing log entries if needed

## Acceptance Criteria

1. Log level configuration: Logger accepts optional minLevel configuration (debug, info, warn, error). Default level is debug (all logs pass through, maintaining backward compatibility).

2. Filtering behavior: Log entries with level below configured minimum are suppressed and not written to log file. For example, if minLevel is warn, then debug() and info() calls produce no output.

3. Level ordering: Log levels follow standard ordering: debug < info < warn < error.

4. Backward compatibility: All existing code works unchanged. Existing createLogger() calls continue to log everything (default level is debug).

5. Type safety: Log level is a string literal union type, not an arbitrary string. TypeScript prevents invalid log levels at compile time.

6. Tests cover all scenarios: Tests verify filtering for each level, edge cases (log at exactly the min level), and default behavior (no filter).

7. Documentation updated: .ushabti/docs/index.md documents the log level configuration in the Pharaoh Log section. No stale references remain.

## Risks / Notes

- No existing use case: This phase adds capability without an immediate consumer. The enhancement is minimal and does not justify a large investment, but it establishes the pattern for future observability work.

- File-based logging limitations: Pharaoh currently writes all logs to a single file. Log level filtering does not address rotation, structured output, or external aggregation. Those concerns are deliberately out of scope.

- Performance: Log filtering happens after message formatting, not before. If performance becomes a concern, we would refactor to short-circuit before formatting. Not addressing now (YAGNI).
