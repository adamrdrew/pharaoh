import type { ServiceStatus, ServiceStatusIdle, ServiceStatusBusy, ServiceStatusDone, ServiceStatusBlocked, PhaseResult, PhaseSuccess, PhaseFailure, PhaseBlocked } from './types.js';
export declare function isIdle(status: ServiceStatus): status is ServiceStatusIdle;
export declare function isBusy(status: ServiceStatus): status is ServiceStatusBusy;
export declare function isDone(status: ServiceStatus): status is ServiceStatusDone;
export declare function isBlocked(status: ServiceStatus): status is ServiceStatusBlocked;
export declare function isSuccess(result: PhaseResult): result is PhaseSuccess;
export declare function isFailure(result: PhaseResult): result is PhaseFailure;
export declare function isPhaseBlocked(result: PhaseResult): result is PhaseBlocked;
//# sourceMappingURL=type-guards.d.ts.map