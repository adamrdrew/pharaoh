# Phase 0002: Welcome Banner

## Intent

Add a startup banner to Pharaoh that logs project metadata through the structured logger when the server starts. The banner provides immediate confirmation that the server is running and displays essential context (project name, version, working directory) for operators and log consumers.

## Scope

**In scope:**
- Modify `src/index.ts` to log startup banner
- Read version from `package.json` using existing filesystem abstraction
- Log 2-3 structured info-level entries immediately after idle status is set
- Include project name, version, and working directory in banner

**Out of scope:**
- ASCII art or color codes
- New dependencies
- New files
- Changes to logger implementation
- Changes to other modules

## Constraints

**Laws:**
- **L04 (Explicit Return Types)**: Any new functions must have explicit return type annotations
- **L06 (Dependency Injection Required)**: Reading package.json must use injected filesystem dependency
- **L07 (Side Effects Behind Injectable Interfaces)**: Filesystem read for package.json must use the `RealFilesystem` abstraction
- **L14 (Truthful Naming)**: Any new identifiers must accurately describe their purpose

**Style:**
- Use structured logger from `log.ts` for all output
- No `console.log` in production code
- Follow existing logging patterns (include structured context in every log entry)
- Prefer `const` over `let` for bindings that don't change

## Acceptance Criteria

1. **Banner is logged on startup**: After `status.setIdle()` is called, the banner is logged via the structured logger
2. **Version is read from package.json**: The version displayed in the banner matches the version in `package.json`
3. **Banner contains required metadata**: The banner includes project name ("Pharaoh"), version (from package.json), and working directory (cwd)
4. **Banner uses structured logging**: All banner entries use `logger.info()` with structured context fields
5. **No ASCII art or color codes**: Banner output is plain text suitable for structured log aggregation
6. **No new dependencies**: The implementation uses only existing dependencies and built-in Node.js modules
7. **Follows dependency injection**: Version reading uses the injected `fs` instance, not direct filesystem access

## Risks / Notes

**Implementation approach:**
The simplest approach is to read `package.json` from `path.join(cwd, 'package.json')` using the existing `fs` instance. The version can be extracted via JSON.parse. If package.json cannot be read, the version should be logged as "unknown" rather than failing startup.

**Alternative deferred:**
A more complex approach would extract version at build time into a generated file, but this adds build complexity and is unnecessary for this simple use case.

**Error handling:**
If reading or parsing package.json fails, the banner should still log with version shown as "unknown". This ensures startup banner is always present even if package.json is missing or malformed.
