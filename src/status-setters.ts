// Status setter methods

import type { ServiceStatus } from './types.js';
import type {
  SetIdleInput,
  SetBusyInput,
  SetDoneInput,
  SetBlockedInput,
} from './status-inputs.js';

export function buildIdleStatus(input: SetIdleInput): ServiceStatus {
  return { status: 'idle', pid: input.pid, started: input.started };
}

export function buildBusyStatus(input: SetBusyInput): ServiceStatus {
  return {
    status: 'busy',
    pid: input.pid,
    started: input.started,
    phase: input.phase,
    phaseStarted: input.phaseStarted,
  };
}

export function buildDoneStatus(input: SetDoneInput): ServiceStatus {
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

export function buildBlockedStatus(input: SetBlockedInput): ServiceStatus {
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
