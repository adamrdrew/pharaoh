import type { LogContext } from './log-types.js';
/**
 * Format a Date as ISO-like timestamp
 */
export declare function formatTimestamp(now: Date): string;
/**
 * Format date part (YYYY-MM-DD)
 */
export declare function formatDate(now: Date): string;
/**
 * Format time part (HH:MM:SS)
 */
export declare function formatTime(now: Date): string;
/**
 * Format context object as JSON string
 */
export declare function formatContext(context?: LogContext): string;
//# sourceMappingURL=log-formatting.d.ts.map