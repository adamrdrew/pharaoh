export type VersionComparison =
  | { readonly comparison: 'less' }
  | { readonly comparison: 'equal' }
  | { readonly comparison: 'greater' }
  | { readonly comparison: 'invalid'; readonly reason: string };

interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

function buildVersion(match: RegExpExecArray): Version {
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function parseVersion(v: string): Version | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!match) return null;
  return buildVersion(match);
}

function compareParsedVersions(
  a: Version,
  b: Version
): 'less' | 'equal' | 'greater' {
  if (a.major !== b.major) return a.major > b.major ? 'greater' : 'less';
  if (a.minor !== b.minor) return a.minor > b.minor ? 'greater' : 'less';
  if (a.patch !== b.patch) return a.patch > b.patch ? 'greater' : 'less';
  return 'equal';
}

function createInvalidResult(a: string, b: string, parsedA: Version | null): VersionComparison {
  const invalid = !parsedA ? a : b;
  return { comparison: 'invalid', reason: `Invalid semver format: ${invalid}` };
}

export function compareVersions(a: string, b: string): VersionComparison {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);
  if (!parsedA || !parsedB) return createInvalidResult(a, b, parsedA);
  const result = compareParsedVersions(parsedA, parsedB);
  return { comparison: result };
}
