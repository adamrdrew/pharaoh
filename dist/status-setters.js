// Status setter methods
export function buildIdleStatus(input) {
    return { status: 'idle', pid: input.pid, started: input.started };
}
export function buildBusyStatus(input) {
    return {
        status: 'busy',
        pid: input.pid,
        started: input.started,
        phase: input.phase,
        phaseStarted: input.phaseStarted,
        turnsElapsed: input.turnsElapsed,
        runningCostUsd: input.runningCostUsd,
    };
}
export function buildDoneStatus(input) {
    return {
        status: 'done',
        pid: input.pid,
        started: input.started,
        phase: input.phase,
        phaseStarted: input.phaseStarted,
        phaseCompleted: input.phaseCompleted,
        costUsd: input.costUsd,
        turns: input.turns,
    };
}
export function buildBlockedStatus(input) {
    return {
        status: 'blocked',
        pid: input.pid,
        started: input.started,
        phase: input.phase,
        phaseStarted: input.phaseStarted,
        phaseCompleted: input.phaseCompleted,
        error: input.error,
        costUsd: input.costUsd,
        turns: input.turns,
    };
}
//# sourceMappingURL=status-setters.js.map