// PID liveness checking for lock validation
/**
 * Real PID checker using process.kill(pid, 0)
 */
export class RealPidChecker {
    isRunning(pid) {
        return isProcessRunning(pid);
    }
}
function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=lock-pid.js.map