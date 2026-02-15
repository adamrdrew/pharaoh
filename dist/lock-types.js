// Lock types and discriminated unions for single-instance enforcement
/**
 * Lock operation error with context
 */
export class LockError extends Error {
    operation;
    reason;
    existingLock;
    constructor(operation, reason, existingLock) {
        const msg = existingLock
            ? `Lock ${operation} failed: ${reason} (held by PID ${existingLock.pid}, started ${existingLock.started})`
            : `Lock ${operation} failed: ${reason}`;
        super(msg);
        this.operation = operation;
        this.reason = reason;
        this.existingLock = existingLock;
        this.name = 'LockError';
    }
}
//# sourceMappingURL=lock-types.js.map