// Type guard validation for ServiceStatus
/**
 * Type guard to validate unknown value is a valid ServiceStatus
 */
export function isValidServiceStatus(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value;
    if (typeof obj.status !== 'string')
        return false;
    if (typeof obj.pid !== 'number')
        return false;
    if (typeof obj.started !== 'string')
        return false;
    switch (obj.status) {
        case 'idle':
            return true;
        case 'busy':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string');
        case 'done':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string' &&
                typeof obj.phaseCompleted === 'string' &&
                typeof obj.costUsd === 'number' &&
                typeof obj.turns === 'number');
        case 'blocked':
            return (typeof obj.phase === 'string' &&
                typeof obj.phaseStarted === 'string' &&
                typeof obj.phaseCompleted === 'string' &&
                typeof obj.error === 'string' &&
                typeof obj.costUsd === 'number' &&
                typeof obj.turns === 'number');
        default:
            return false;
    }
}
//# sourceMappingURL=validation.js.map