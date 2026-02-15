import type { Filesystem } from './status.js';
import type { LoggerConfig, LogContext } from './log-types.js';
export type { LogLevel, LoggerConfig, LogContext } from './log-types.js';
/**
 * Structured logger that writes timestamped entries to pharaoh.log
 */
export declare class Logger {
    private readonly fs;
    private readonly logPath;
    private readonly minLevel;
    constructor(fs: Filesystem, logPath: string, config?: LoggerConfig);
    private shouldLog;
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