// Type definitions and constants for logger

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
export const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

/**
 * Structured context for log entries
 */
export type LogContext = Record<string, unknown>;
