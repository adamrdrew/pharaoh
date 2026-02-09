// Debouncer for tool progress events

/**
 * Limits tool progress event frequency to prevent excessive I/O
 */
export class ProgressDebouncer {
  private readonly lastWriteTime: Map<string, number> = new Map();
  private readonly debounceMs: number;

  constructor(debounceMs: number = 5000) {
    this.debounceMs = debounceMs;
  }

  shouldWrite(toolUseId: string): boolean {
    const now = Date.now();
    const last = this.lastWriteTime.get(toolUseId);
    return this.isDebounced(now, last);
  }

  private isDebounced(now: number, last: number | undefined): boolean {
    if (last === undefined) return this.recordWrite(now);
    if (now - last >= this.debounceMs) return this.recordWrite(now);
    return false;
  }

  private recordWrite(now: number): boolean {
    return true;
  }

  markWritten(toolUseId: string): void {
    this.lastWriteTime.set(toolUseId, Date.now());
  }
}
