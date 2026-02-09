import type { Filesystem } from './status.js';
/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Structured context for log entries
 */
export type LogContext = Record<string, unknown>;
/**
 * Structured logger that writes timestamped entries to pharaoh.log
 */
export declare class Logger {
    private readonly fs;
    private readonly logPath;
    constructor(fs: Filesystem, logPath: string);
    private formatTimestamp;
    private formatDate;
    private formatTime;
    /**
     * Format context object as JSON string
     */
    private formatContext;
    private write;
    private buildLogEntry;
    /**
     * Log debug message (verbose internal state)
     */
    debug(message: string, context?: LogContext): Promise<void>;
    /**
     * Log info message (normal operations)
     */
    info(message: string, context?: LogContext): Promise<void>;
    /**
     * Log warning (recoverable errors)
     */
    warn(message: string, context?: LogContext): Promise<void>;
    /**
     * Log error (unrecoverable errors)
     */
    error(message: string, context?: LogContext): Promise<void>;
}
//# sourceMappingURL=log.d.ts.map