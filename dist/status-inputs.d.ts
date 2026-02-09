export interface SetIdleInput {
    readonly pid: number;
    readonly started: string;
}
export interface SetBusyInput {
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
}
export interface SetDoneInput {
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
    readonly phaseCompleted: string;
    readonly costUsd: number;
    readonly turns: number;
}
export interface SetBlockedInput {
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
    readonly phaseCompleted: string;
    readonly error: string;
    readonly costUsd: number;
    readonly turns: number;
}
//# sourceMappingURL=status-inputs.d.ts.map