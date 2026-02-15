# Steps

## S001: Define log level types

**Intent:** Establish type-safe log level values and configuration interface.

**Work:**
- Update src/log.ts with LogLevel string literal union type: debug | info | warn | error
- Add LoggerConfig interface with optional minLevel: LogLevel field
- Define logLevelPriority constant mapping levels to numeric priorities for comparison
- Export types for use in tests and future consumers

**Done when:** Types compile and export correctly. No implementation changes yet.

## S002: Add log level filtering to RealLogger

**Intent:** Implement filtering logic in the logger implementation.

**Work:**
- Update RealLogger constructor to accept optional config: LoggerConfig parameter
- Add private minLevel property initialized from config (default: debug)
- Create private shouldLog(level: LogLevel): boolean helper using logLevelPriority comparison
- Update debug(), info(), warn(), error() methods to call shouldLog() before writing
- Ensure existing behavior unchanged when no config provided

**Done when:** RealLogger filters logs based on configured level. Compiles without errors.

## S003: Add tests for log level filtering

**Intent:** Verify filtering behavior for all log levels and edge cases.

**Work:**
- Update tests/log.test.ts (or create if missing)
- Test: Default behavior (no config) logs all levels
- Test: minLevel: info suppresses debug logs
- Test: minLevel: warn suppresses debug and info logs
- Test: minLevel: error suppresses debug, info, and warn logs
- Test: Log at exactly the minimum level passes through
- Use fake filesystem to verify log file contents

**Done when:** All log level filtering scenarios covered. Tests pass.

## S004: Update documentation

**Intent:** Document log level configuration in project docs.

**Work:**
- Update .ushabti/docs/index.md in the Pharaoh Log section
- Add subsection describing log level configuration
- Document default behavior (all logs) and filtering behavior
- Provide example of creating logger with custom level
- Ensure no stale references to unfiltered-only behavior

**Done when:** Documentation includes log level filtering. Section is clear and accurate.

## S005: Refactor log.ts to meet 100-line limit

**Intent:** Decompose log.ts to comply with Sandi Metz 100-line module limit.

**Work:**
- Extract timestamp formatting helpers to separate module (e.g., log-formatting.ts)
- Move LogLevel, LoggerConfig, logLevelPriority types and constants to log-types.ts
- Update imports in log.ts and tests/log.test.ts
- Verify all tests still pass
- Ensure log.ts is 100 lines or fewer after refactoring

**Done when:** log.ts is 100 lines or fewer and all tests pass. Functionality unchanged.
