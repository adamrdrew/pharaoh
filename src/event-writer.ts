// Event writer for structured event capture

import type { Filesystem } from './status.js';

/**
 * Event type discriminators for SDK message events
 */
export type PharaohEventType =
  | 'tool_call'
  | 'tool_progress'
  | 'tool_summary'
  | 'text'
  | 'turn'
  | 'status'
  | 'result'
  | 'error';

/**
 * Structured event for external consumption.
 * Written to .pharaoh/events.jsonl in JSON Lines format.
 */
export interface PharaohEvent {
  /**
   * ISO8601 timestamp when event was captured
   */
  readonly timestamp: string;

  /**
   * Event type discriminator
   */
  readonly type: PharaohEventType;

  /**
   * Optional agent name (e.g., 'Scribe', 'Builder', 'Overseer')
   */
  readonly agent?: string;

  /**
   * Human-readable event summary (truncated for brevity)
   */
  readonly summary: string;

  /**
   * Optional structured detail object (tool inputs, usage, etc.)
   */
  readonly detail?: Record<string, unknown>;
}

/**
 * Writes events to .pharaoh/events.jsonl in append-only JSON Lines format
 */
export class EventWriter {
  constructor(
    private readonly fs: Filesystem,
    private readonly eventsPath: string
  ) {}

  async write(event: PharaohEvent): Promise<void> {
    const line = JSON.stringify(event) + '\n';
    await this.fs.appendFile(this.eventsPath, line);
  }

  async clear(): Promise<void> {
    await this.fs.writeFile(this.eventsPath, '');
  }
}
