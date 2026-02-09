// Type guards for discriminated unions

import type {
  ServiceStatus,
  ServiceStatusIdle,
  ServiceStatusBusy,
  ServiceStatusDone,
  ServiceStatusBlocked,
  PhaseResult,
  PhaseSuccess,
  PhaseFailure,
  PhaseBlocked,
} from './types.js';

export function isIdle(status: ServiceStatus): status is ServiceStatusIdle {
  return status.status === 'idle';
}

export function isBusy(status: ServiceStatus): status is ServiceStatusBusy {
  return status.status === 'busy';
}

export function isDone(status: ServiceStatus): status is ServiceStatusDone {
  return status.status === 'done';
}

export function isBlocked(
  status: ServiceStatus
): status is ServiceStatusBlocked {
  return status.status === 'blocked';
}

export function isSuccess(result: PhaseResult): result is PhaseSuccess {
  return result.ok === true;
}

export function isFailure(result: PhaseResult): result is PhaseFailure {
  return result.ok === false && result.reason !== 'blocked';
}

export function isPhaseBlocked(result: PhaseResult): result is PhaseBlocked {
  return result.ok === false && result.reason === 'blocked';
}
