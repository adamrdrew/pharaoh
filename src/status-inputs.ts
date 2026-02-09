// Input types for StatusManager methods

export interface SetIdleInput {
  readonly pid: number;
  readonly started: string;
}

export interface SetBusyInput {
  readonly pid: number;
  readonly started: string;
  readonly phase: string;
  readonly phaseStarted: string;
  /**
   * Number of assistant messages (turns) elapsed during execution
   */
  readonly turnsElapsed: number;
  /**
   * Running cost in USD accumulated from token usage (heuristic based on Opus 4 pricing)
   */
  readonly runningCostUsd: number;
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
