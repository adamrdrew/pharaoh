// Lock types and discriminated unions for single-instance enforcement

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
export type LockState =
  | LockAcquired
  | LockHeldByOther
  | LockStale;

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
export type LockResult =
  | { readonly ok: true; readonly value: LockInfo }
  | { readonly ok: false; readonly error: LockError };

/**
 * Lock operation error with context
 */
export class LockError extends Error {
  constructor(
    public readonly operation: 'acquire' | 'validate' | 'release',
    public readonly reason: string,
    public readonly existingLock?: LockInfo
  ) {
    const msg = existingLock
      ? `Lock ${operation} failed: ${reason} (held by PID ${existingLock.pid}, started ${existingLock.started})`
      : `Lock ${operation} failed: ${reason}`;
    super(msg);
    this.name = 'LockError';
  }
}
