/**
 * Service status state machine.
 * Transitions: idle → busy → (done|blocked) → idle
 */
export type ServiceStatus = ServiceStatusIdle | ServiceStatusBusy | ServiceStatusDone | ServiceStatusBlocked;
export interface ServiceStatusIdle {
    readonly status: 'idle';
    readonly pid: number;
    readonly started: string;
}
export interface ServiceStatusBusy {
    readonly status: 'busy';
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
}
export interface ServiceStatusDone {
    readonly status: 'done';
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
    readonly phaseCompleted: string;
    readonly costUsd: number;
    readonly turns: number;
}
export interface ServiceStatusBlocked {
    readonly status: 'blocked';
    readonly pid: number;
    readonly started: string;
    readonly phase: string;
    readonly phaseStarted: string;
    readonly phaseCompleted: string;
    readonly error: string;
    readonly costUsd: number;
    readonly turns: number;
}
/**
 * Dispatch file structure (markdown with YAML frontmatter)
 */
export interface DispatchFile {
    readonly phase?: string;
    readonly model?: string;
    readonly body: string;
}
/**
 * Phase execution result discriminated union
 */
export type PhaseResult = PhaseSuccess | PhaseFailure | PhaseBlocked;
export interface PhaseSuccess {
    readonly ok: true;
    readonly costUsd: number;
    readonly turns: number;
    readonly durationMs: number;
}
export interface PhaseFailure {
    readonly ok: false;
    readonly reason: 'sdk_error' | 'max_turns' | 'abort';
    readonly error: string;
    readonly costUsd: number;
    readonly turns: number;
    readonly durationMs: number;
}
export interface PhaseBlocked {
    readonly ok: false;
    readonly reason: 'blocked';
    readonly error: string;
    readonly costUsd: number;
    readonly turns: number;
    readonly durationMs: number;
}
//# sourceMappingURL=types.d.ts.map