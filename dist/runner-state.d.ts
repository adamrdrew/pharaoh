export interface RunnerState {
    turns: number;
    costUsd: number;
    messageCounter: number;
    inputTokens: number;
    outputTokens: number;
    turnsElapsed: number;
    runningCostUsd: number;
}
export interface PhaseContext {
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
}
export declare function updateState(message: unknown, state: RunnerState): void;
//# sourceMappingURL=runner-state.d.ts.map