// Status setter methods
export function buildIdleStatus(input) {
    return {
        status: 'idle',
        ...input,
    };
}
export function buildBusyStatus(input) {
    return {
        status: 'busy',
        ...input,
    };
}
export function buildDoneStatus(input) {
    return {
        status: 'done',
        ...input,
    };
}
export function buildBlockedStatus(input) {
    return {
        status: 'blocked',
        ...input,
    };
}
//# sourceMappingURL=status-setters.js.map