# Steps

## S001: Create version comparison types

**Intent:** Define type-safe discriminated union for comparison results.

**Work:**
- Create `src/version-compare.ts`
- Define `VersionComparison` type as discriminated union:
  - `{ comparison: 'less' }`
  - `{ comparison: 'equal' }`
  - `{ comparison: 'greater' }`
  - `{ comparison: 'invalid'; reason: string }`
- Export the type

**Done when:** `VersionComparison` type exists with all four variants.

## S002: Create version parsing helper

**Intent:** Extract version components from semver string.

**Work:**
- Define `Version` interface with `{ major: number; minor: number; patch: number }`
- Create `parseVersion(v: string): Version | null` function
- Use regex `/^(\d+)\.(\d+)\.(\d+)$/` to extract major/minor/patch
- Return `null` if format is invalid
- Add explicit return type

**Done when:** `parseVersion` function exists and handles valid/invalid inputs.

## S003: Implement compareVersions function

**Intent:** Compare two version strings and return typed result.

**Work:**
- Create `export function compareVersions(a: string, b: string): VersionComparison`
- Parse both versions using `parseVersion`
- If either parse fails, return `{ comparison: 'invalid', reason: 'Invalid semver format: ...' }`
- Compare major, then minor, then patch (short-circuit on first difference)
- Return appropriate `{ comparison: 'less' | 'equal' | 'greater' }`

**Done when:** `compareVersions` function exists with explicit return type and handles all cases.

## S004: Extract comparison logic helper

**Intent:** Keep compareVersions under 5 lines per Sandi Metz rules.

**Work:**
- Create `compareParsedVersions(a: Version, b: Version): 'less' | 'equal' | 'greater'`
- Implement three-way comparison logic (major → minor → patch)
- Return comparison result string
- Call from `compareVersions` after successful parsing

**Done when:** `compareParsedVersions` helper exists and `compareVersions` uses it.

## S005: Write tests for valid version comparisons

**Intent:** Verify correct comparison behavior.

**Work:**
- Create `tests/version-compare.test.ts`
- Test: "returns greater when major version is higher" — `compareVersions('2.0.0', '1.0.0')` → `{ comparison: 'greater' }`
- Test: "returns greater when minor version is higher" — `compareVersions('1.2.0', '1.1.0')` → `{ comparison: 'greater' }`
- Test: "returns greater when patch version is higher" — `compareVersions('1.0.2', '1.0.1')` → `{ comparison: 'greater' }`
- Test: "returns less when first version is lower" — `compareVersions('1.0.0', '2.0.0')` → `{ comparison: 'less' }`
- Test: "returns equal when versions match" — `compareVersions('1.2.3', '1.2.3')` → `{ comparison: 'equal' }`

**Done when:** All valid comparison tests pass.

## S006: Write tests for invalid version formats

**Intent:** Verify invalid input handling.

**Work:**
- Test: "returns invalid for non-semver format" — `compareVersions('invalid', '1.0.0')` → `{ comparison: 'invalid', reason: '...' }`
- Test: "returns invalid for missing components" — `compareVersions('1.0', '1.0.0')` → `{ comparison: 'invalid', reason: '...' }`
- Test: "returns invalid for non-numeric components" — `compareVersions('1.a.0', '1.0.0')` → `{ comparison: 'invalid', reason: '...' }`
- Test: "returns invalid when both inputs are invalid" — `compareVersions('bad', 'worse')` → `{ comparison: 'invalid', reason: '...' }`

**Done when:** All invalid input tests pass.

## S007: Write tests for edge cases

**Intent:** Verify boundary conditions.

**Work:**
- Test: "handles zero versions" — `compareVersions('0.0.0', '0.0.1')` → `{ comparison: 'less' }`
- Test: "handles large version numbers" — `compareVersions('999.999.999', '1000.0.0')` → `{ comparison: 'less' }`

**Done when:** Edge case tests pass.

## S008: Run full test suite

**Intent:** Verify no regressions and all new tests pass.

**Work:**
- Run `npm test`
- Verify all existing tests still pass
- Verify all new version-compare tests pass

**Done when:** `npm test` exits with code 0, all tests green.
