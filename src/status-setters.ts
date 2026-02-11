// Status setter methods

import type { ServiceStatus } from './types.js';
import type {
  SetIdleInput,
  SetBusyInput,
  SetDoneInput,
  SetBlockedInput,
} from './status-inputs.js';

export function buildIdleStatus(input: SetIdleInput): ServiceStatus {
  return {
    status: 'idle',
    ...input,
  };
}

export function buildBusyStatus(input: SetBusyInput): ServiceStatus {
  return {
    status: 'busy',
    ...input,
  };
}

export function buildDoneStatus(input: SetDoneInput): ServiceStatus {
  return {
    status: 'done',
    ...input,
  };
}

export function buildBlockedStatus(input: SetBlockedInput): ServiceStatus {
  return {
    status: 'blocked',
    ...input,
  };
}
