export type VersionComparison = {
    readonly comparison: 'less';
} | {
    readonly comparison: 'equal';
} | {
    readonly comparison: 'greater';
} | {
    readonly comparison: 'invalid';
    readonly reason: string;
};
export declare function compareVersions(a: string, b: string): VersionComparison;
//# sourceMappingURL=version-compare.d.ts.map