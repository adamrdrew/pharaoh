/**
 * PID liveness checker interface for testing
 */
export interface PidChecker {
    isRunning(pid: number): boolean;
}
/**
 * Real PID checker using process.kill(pid, 0)
 */
export declare class RealPidChecker implements PidChecker {
    isRunning(pid: number): boolean;
}
//# sourceMappingURL=lock-pid.d.ts.map