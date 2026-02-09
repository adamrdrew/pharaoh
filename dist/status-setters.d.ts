import type { ServiceStatus } from './types.js';
import type { SetIdleInput, SetBusyInput, SetDoneInput, SetBlockedInput } from './status-inputs.js';
export declare function buildIdleStatus(input: SetIdleInput): ServiceStatus;
export declare function buildBusyStatus(input: SetBusyInput): ServiceStatus;
export declare function buildDoneStatus(input: SetDoneInput): ServiceStatus;
export declare function buildBlockedStatus(input: SetBlockedInput): ServiceStatus;
//# sourceMappingURL=status-setters.d.ts.map