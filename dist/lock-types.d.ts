/**
 * Lock information stored in pharaoh.lock file
 */
export interface LockInfo {
    readonly pid: number;
    readonly started: string;
    readonly instanceId: string;
}
/**
 * Lock state discriminated union
 */
export type LockState = LockAcquired | LockHeldByOther | LockStale;
export interface LockAcquired {
    readonly state: 'acquired';
    readonly info: LockInfo;
}
export interface LockHeldByOther {
    readonly state: 'held-by-other';
    readonly info: LockInfo;
}
export interface LockStale {
    readonly state: 'stale';
    readonly info: LockInfo;
}
/**
 * Lock operation result type
 */
export type LockResult = {
    readonly ok: true;
    readonly value: LockInfo;
} | {
    readonly ok: false;
    readonly error: LockError;
};
/**
 * Lock operation error with context
 */
export declare class LockError extends Error {
    readonly operation: 'acquire' | 'validate' | 'release';
    readonly reason: string;
    readonly existingLock?: LockInfo | undefined;
    constructor(operation: 'acquire' | 'validate' | 'release', reason: string, existingLock?: LockInfo | undefined);
}
//# sourceMappingURL=lock-types.d.ts.map