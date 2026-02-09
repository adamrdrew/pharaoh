// Core types and discriminated unions for Pharaoh
// Type guards
export function isIdle(status) {
    return status.status === 'idle';
}
export function isBusy(status) {
    return status.status === 'busy';
}
export function isDone(status) {
    return status.status === 'done';
}
export function isBlocked(status) {
    return status.status === 'blocked';
}
export function isSuccess(result) {
    return result.ok === true;
}
export function isFailure(result) {
    return result.ok === false && result.reason !== 'blocked';
}
export function isPhaseBlocked(result) {
    return result.ok === false && result.reason === 'blocked';
}
//# sourceMappingURL=types.js.map