# Project Style Guide

## Purpose

This style guide defines the conventions, patterns, and expectations for building Pharaoh. These conventions promote consistency, maintainability, and testability across the codebase. All code must follow these conventions unless a specific engineering rationale for deviation is documented and approved.

During development, Builder applies these conventions. During review, Overseer verifies compliance.

---

## Project Structure

### Directory Layout

```
pharoh/
├── src/
│   ├── index.ts         # CLI entry point
│   ├── runner.ts        # SDK query execution
│   ├── watcher.ts       # Dispatch directory watcher
│   ├── status.ts        # service.json status management
│   ├── hooks.ts         # SDK hooks
│   └── log.ts           # Structured logging
├── tests/               # Tests mirror src/ structure
│   ├── runner.test.ts
│   ├── watcher.test.ts
│   ├── status.test.ts
│   ├── hooks.test.ts
│   └── log.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Module Boundaries

- **Flat `src/` directory**: No subdirectories. All modules at the top level.
- **One module per file**: Each file exports a single primary responsibility.
- **Specific modules are canonical**:
  - `index.ts` — CLI entry point and argument parsing
  - `runner.ts` — Claude Agent SDK query execution
  - `watcher.ts` — Filesystem watcher for dispatch directory
  - `status.ts` — Reading and writing `service.json`
  - `hooks.ts` — SDK event hooks
  - `log.ts` — Structured logging infrastructure

### Ownership Expectations

- Each module owns its interfaces and types.
- Shared types go in the module that defines the primary concept (e.g., `runner.ts` owns SDK-related types).
- No circular dependencies. If two modules need to reference each other, extract shared types to a separate file.

---

## Language & Tooling Conventions

### Language and Runtime

- **TypeScript 5.x** with `strict: true` (enforced by L01)
- **Node.js LTS** (currently 20.x or later)
- **ES2022 target** for modern syntax

### Variable Declarations

- **Prefer `const`** over `let` for all bindings that don't change.
- **Never use `var`**. It has broken scoping semantics.

```typescript
// Good
const maxRetries = 3;
let attempts = 0;

// Bad
var maxRetries = 3; // Never use var
let configPath = '/config'; // Use const if it never changes
```

### Property Mutability

- **Prefer `readonly`** on all class properties and interface members that don't need mutation.
- Immutable-by-default reduces cognitive load and prevents accidental mutation bugs.

```typescript
// Good
interface Config {
  readonly dispatchPath: string;
  readonly pollIntervalMs: number;
}

class Watcher {
  private readonly config: Config;
  private busy: boolean = false; // Not readonly because it changes

  constructor(config: Config) {
    this.config = config;
  }
}

// Bad
interface Config {
  dispatchPath: string; // Should be readonly
  pollIntervalMs: number; // Should be readonly
}
```

### Type Safety and Discriminated Unions

- **Use discriminated unions** to make invalid states unrepresentable.
- **Use exhaustive switches** with `never` checks to catch missing cases at compile time.

```typescript
// Good: Invalid states are impossible
type JobStatus =
  | { status: 'pending' }
  | { status: 'running'; startedAt: Date }
  | { status: 'complete'; result: string }
  | { status: 'failed'; error: Error };

function handleStatus(job: JobStatus): void {
  switch (job.status) {
    case 'pending':
      // No startedAt access — it doesn't exist
      break;
    case 'running':
      console.log(job.startedAt); // Safe: startedAt exists here
      break;
    case 'complete':
      console.log(job.result);
      break;
    case 'failed':
      console.log(job.error);
      break;
    default:
      const _exhaustive: never = job; // Compile error if we miss a case
      throw new Error(`Unhandled status: ${JSON.stringify(_exhaustive)}`);
  }
}

// Bad: Invalid states are possible
interface Job {
  status: 'pending' | 'running' | 'complete' | 'failed';
  startedAt?: Date; // Can be present when status is 'pending' — invalid!
  result?: string;
  error?: Error;
}
```

### File Naming and Organization

- **Kebab-case filenames**: `my-module.ts`, not `MyModule.ts` or `my_module.ts`.
- **One type per file**: The filename matches the primary export.
- **Exceptions**: Small, tightly coupled types (e.g., discriminated union variants) may live in the same file.

```typescript
// file: dispatch-event.ts
export interface DispatchEvent {
  readonly path: string;
  readonly timestamp: Date;
}

// file: watcher.ts
import type { DispatchEvent } from './dispatch-event.js';
```

### Dependency Management

- Use `npm` (lock with `package-lock.json`).
- Pin exact versions for production dependencies in `package.json` (no `^` or `~`).
- Development dependencies may use ranges.

---

## Architectural Patterns

### Preferred Patterns

#### Dependency Injection (L06, L07)

All dependencies are injected via constructor or method parameters. No module instantiates its own dependencies.

```typescript
// Good
class JobRunner {
  constructor(
    private readonly sdk: SDKClient,
    private readonly logger: Logger
  ) {}

  async run(jobPath: string): Promise<Result> {
    this.logger.info('Starting job', { jobPath });
    return this.sdk.query(jobPath);
  }
}

// Bad
class JobRunner {
  private readonly sdk = new SDKClient(); // Violates L06
  private readonly logger = console; // Violates L07

  async run(jobPath: string): Promise<Result> {
    this.logger.log('Starting job');
    return this.sdk.query(jobPath);
  }
}
```

#### Interface Abstractions for Side Effects (L07)

All side effects (filesystem, SDK calls, process signals) live behind interfaces.

```typescript
// filesystem.ts
export interface Filesystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  watch(path: string, callback: (event: string) => void): void;
}

// watcher.ts
export class DispatchWatcher {
  constructor(private readonly fs: Filesystem) {}

  watch(dispatchPath: string): void {
    this.fs.watch(dispatchPath, (event) => {
      // Handle dispatch event
    });
  }
}
```

#### Functional Iteration

Prefer `map`, `filter`, `reduce`, and `flatMap` over imperative loops.

```typescript
// Good
const validJobs = files
  .filter(f => f.endsWith('.json'))
  .map(f => parseJob(f));

// Acceptable when clarity demands it
const validJobs: Job[] = [];
for (const file of files) {
  if (file.endsWith('.json')) {
    const job = parseJob(file);
    if (job.isValid()) {
      validJobs.push(job);
    }
  }
}
```

#### Sandi Metz Rules (Adapted for TypeScript)

1. **Classes/modules max 100 lines**: If a module exceeds 100 lines, split it.
2. **Functions max 5 lines**: Extract helper functions to keep functions short.
3. **Max 4 parameters**: Beyond 4 parameters, use an options object.
4. **Constructors instantiate at most one collaborator**: Inject the rest.

```typescript
// Good: Options object for >4 parameters
interface WatcherOptions {
  readonly dispatchPath: string;
  readonly pollIntervalMs: number;
  readonly ignoreHidden: boolean;
  readonly extensions: readonly string[];
}

class DispatchWatcher {
  constructor(
    private readonly fs: Filesystem, // One instantiation allowed here
    private readonly options: WatcherOptions
  ) {}
}

// Bad: Too many parameters
class DispatchWatcher {
  constructor(
    private readonly fs: Filesystem,
    private readonly dispatchPath: string,
    private readonly pollIntervalMs: number,
    private readonly ignoreHidden: boolean,
    private readonly extensions: string[]
  ) {}
}
```

### Discouraged / Forbidden

#### No `console.log` in Production Code

Use the structured logger from `log.ts`. Console logging is unstructured and difficult to filter or aggregate.

```typescript
// Good
logger.info('Job started', { jobId, path });

// Bad
console.log('Job started:', jobId, path);
```

#### No Raw String Errors

Always throw typed error classes with context. Raw strings lose stack traces and context.

```typescript
// Good
export class JobParseError extends Error {
  constructor(
    public readonly path: string,
    public readonly cause: unknown
  ) {
    super(`Failed to parse job at ${path}: ${cause}`);
    this.name = 'JobParseError';
  }
}

throw new JobParseError('/jobs/001.json', originalError);

// Bad
throw 'Failed to parse job'; // No context, no stack trace
throw new Error('Failed to parse job'); // No context properties
```

#### No Untyped Error Handling

Operations that can fail should return typed results, not throw exceptions for expected failures.

```typescript
// Good: Typed result for expected failures
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJob(path: string): Result<Job, JobParseError> {
  try {
    const content = readFileSync(path, 'utf-8');
    const job = JSON.parse(content);
    return { ok: true, value: job };
  } catch (err) {
    return { ok: false, error: new JobParseError(path, err) };
  }
}

// Acceptable: Throw for unexpected failures (e.g., out of memory)
```

#### No Imperative Loops for Simple Transforms

If the operation is a simple map/filter/reduce, use the functional equivalent.

```typescript
// Good
const ids = jobs.map(j => j.id);

// Bad (for simple transforms)
const ids = [];
for (const job of jobs) {
  ids.push(job.id);
}
```

---

## Testing Strategy

### Test Location and Structure

- **Tests mirror source structure**: `tests/runner.test.ts` tests `src/runner.ts`.
- **One test file per source file**.
- **Use vitest** as the test runner.

### Test Naming and Organization

- **Descriptive test names** that read like specifications:
  - `test('dispatch watcher ignores files while busy')`
  - `test('job runner retries on transient SDK errors')`
  - `test('status manager overwrites existing service.json')`

- **Arrange-Act-Assert pattern**:

```typescript
test('watcher emits event when new file appears', () => {
  // Arrange
  const mockFs = createMockFilesystem();
  const watcher = new DispatchWatcher(mockFs, { dispatchPath: '/jobs' });
  const events: DispatchEvent[] = [];
  watcher.on('dispatch', (e) => events.push(e));

  // Act
  mockFs.triggerFileCreate('/jobs/001.json');

  // Assert
  expect(events).toHaveLength(1);
  expect(events[0].path).toBe('/jobs/001.json');
});
```

### Mocking and Test Doubles (L08)

- **No real I/O in unit tests**: All filesystem, SDK, and process interactions use test doubles.
- **Prefer fakes over mocks** when the fake is simple and reusable.
- **Verify behavior, not implementation**: Avoid over-specifying mock calls.

```typescript
// Good: Fake filesystem for testing
class FakeFilesystem implements Filesystem {
  private files = new Map<string, string>();

  readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return Promise.resolve(content);
  }

  writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    return Promise.resolve();
  }
}

// Bad: Real filesystem in unit test
test('watcher reads dispatch file', async () => {
  await fs.writeFile('/tmp/test.json', '{}'); // Violates L08
  // ...
});
```

### Coverage Expectations (L09)

- **All public methods must have tests** covering all conditional paths.
- **All error conditions must be tested**: Success path alone is insufficient.
- **Private methods are tested indirectly** through public API.

---

## Error Handling & Observability

### Custom Error Classes

Every error class must include context about what operation failed and with what input.

```typescript
export class DispatchFileError extends Error {
  constructor(
    public readonly operation: 'read' | 'parse' | 'validate',
    public readonly path: string,
    public readonly cause: unknown
  ) {
    super(`Dispatch file ${operation} failed for ${path}: ${cause}`);
    this.name = 'DispatchFileError';
  }
}
```

### Typed Result Values

For operations where failure is expected and recoverable, return typed results instead of throwing.

```typescript
type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

function parseDispatchFile(path: string): ParseResult<DispatchJob> {
  // ...
}

// Usage
const result = parseDispatchFile('/jobs/001.json');
if (!result.ok) {
  logger.warn('Failed to parse dispatch file', { error: result.error });
  return;
}
const job = result.value;
```

### Structured Logging

- **Use the logger from `log.ts`** for all observability.
- **Include structured context** in every log entry.
- **Log levels**:
  - `debug`: Verbose internal state (not shown in production)
  - `info`: Normal operations (job started, file processed)
  - `warn`: Recoverable errors (transient failure, retry scheduled)
  - `error`: Unrecoverable errors (job failed permanently)

```typescript
logger.info('Dispatch file processed', { path, jobId, durationMs });
logger.warn('SDK query failed, retrying', { jobId, attempt, maxRetries });
logger.error('Job failed permanently', { jobId, error: error.message });
```

---

## Performance & Resource Use

### Expectations

- **Startup time**: CLI must respond within 200ms for typical operations.
- **Memory**: Watcher must not accumulate unbounded state (use cleanup hooks for event listeners).
- **Concurrency**: Only one dispatch job runs at a time (enforced by busy flag in watcher).

### Common Pitfalls

- **Forgetting to remove event listeners**: Always clean up listeners when watchers stop.
- **Unbounded retry loops**: Always cap retry attempts.
- **Blocking the event loop**: Use `setImmediate` or async iteration for large lists.

---

## Review Checklist

Overseer must verify the following before marking a Phase GREEN:

### Code Quality

- [ ] All modules under 100 lines
- [ ] All functions under 5 lines (or documented rationale for exception)
- [ ] No function has more than 4 parameters (or uses options object)
- [ ] All variables use `const` unless mutation is required
- [ ] All class properties are `readonly` unless mutation is required
- [ ] Discriminated unions used for state modeling
- [ ] Exhaustive switch statements with `never` checks
- [ ] Kebab-case filenames match primary exports

### Dependency Injection and Abstractions

- [ ] All dependencies injected via constructor/parameters (L06)
- [ ] All side effects behind injectable interfaces (L07)
- [ ] Constructors instantiate at most one collaborator

### Error Handling

- [ ] No raw string throws
- [ ] All error classes include operation and input context
- [ ] Expected failures use typed results
- [ ] No `console.log` in production code

### Testing

- [ ] Test file mirrors source structure
- [ ] All public methods have tests
- [ ] All conditional paths covered (L09)
- [ ] No real filesystem or SDK calls in tests (L08)
- [ ] Arrange-Act-Assert pattern used
- [ ] Descriptive test names

### Observability

- [ ] All operations logged with structured context
- [ ] Appropriate log levels used
- [ ] No sensitive data in logs

### Documentation Reconciliation (L15, L17)

- [ ] All affected documentation updated
- [ ] No stale references to changed APIs or behavior
