// Throttler for status updates

/**
 * Limits status update frequency to prevent excessive I/O
 */
export class StatusThrottler {
  private lastWriteTime = 0;
  private readonly throttleMs: number;

  constructor(throttleMs: number = 5000) {
    this.throttleMs = throttleMs;
  }

  shouldWrite(): boolean {
    const now = Date.now();
    return this.checkThrottle(now);
  }

  private checkThrottle(now: number): boolean {
    if (now - this.lastWriteTime >= this.throttleMs) {
      this.lastWriteTime = now;
      return true;
    }
    return false;
  }
}
