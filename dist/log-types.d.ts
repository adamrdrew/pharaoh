/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Logger configuration
 */
export interface LoggerConfig {
    readonly minLevel?: LogLevel;
}
/**
 * Log level priority mapping for filtering
 */
export declare const logLevelPriority: Record<LogLevel, number>;
/**
 * Structured context for log entries
 */
export type LogContext = Record<string, unknown>;
//# sourceMappingURL=log-types.d.ts.map