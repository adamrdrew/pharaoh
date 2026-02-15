// PID liveness checking for lock validation

/**
 * PID liveness checker interface for testing
 */
export interface PidChecker {
  isRunning(pid: number): boolean;
}

/**
 * Real PID checker using process.kill(pid, 0)
 */
export class RealPidChecker implements PidChecker {
  isRunning(pid: number): boolean {
    return isProcessRunning(pid);
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
