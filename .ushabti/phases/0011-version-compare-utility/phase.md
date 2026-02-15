# Phase 0011: Version Compare Utility

## Intent

Add a semver-compatible version comparison utility to support future version-checking features. This Phase verifies the Ushabti workflow with minimal scope and clear acceptance criteria.

## Scope

**In scope:**
- Create `version-compare.ts` module with `compareVersions` function
- Support semantic version comparison (MAJOR.MINOR.PATCH)
- Full unit test coverage in `tests/version-compare.test.ts`
- Explicit return types and no type assertions
- Follow Sandi Metz rules (max 5 lines per function)

**Out of scope:**
- Integration with existing Pharaoh systems (no usage of the utility yet)
- Prerelease version support (e.g., `1.0.0-alpha`)
- Build metadata support (e.g., `1.0.0+build123`)
- Version parsing beyond basic semver format

## Constraints

- L02: No `any` type
- L03: No type assertions except at validated system boundaries
- L04: Explicit return types on all public functions
- L09: All conditional paths covered by tests
- L10: Tests must be deterministic and independent
- Sandi Metz: Functions max 5 lines, max 4 parameters
- Discriminated unions for return values

## Acceptance Criteria

1. **Module exists** — `src/version-compare.ts` exports `compareVersions(a: string, b: string): VersionComparison`
2. **Type-safe result** — Return type is discriminated union with `{ comparison: 'less' | 'equal' | 'greater' } | { comparison: 'invalid', reason: string }`
3. **MAJOR comparison works** — `compareVersions('2.0.0', '1.0.0')` returns `greater`
4. **MINOR comparison works** — `compareVersions('1.2.0', '1.1.0')` returns `greater`
5. **PATCH comparison works** — `compareVersions('1.0.2', '1.0.1')` returns `greater`
6. **Equality works** — `compareVersions('1.2.3', '1.2.3')` returns `equal`
7. **Invalid format handled** — `compareVersions('invalid', '1.0.0')` returns `{ comparison: 'invalid', reason: '...' }`
8. **All tests pass** — `npm test` exits with code 0
9. **No regressions** — All existing tests still pass

## Risks / Notes

- This is a proof-of-concept Phase to verify the Ushabti workflow
- The utility is not yet integrated into Pharaoh systems — that's deferred to a future Phase when version checking is needed
- Prerelease and build metadata support can be added later if needed
