// Structured logger for pharaoh.log

import type { Filesystem } from './status.js';
import type { LogLevel, LoggerConfig, LogContext } from './log-types.js';
import { logLevelPriority } from './log-types.js';
import { formatTimestamp, formatContext } from './log-formatting.js';

// Re-export types for backward compatibility
export type { LogLevel, LoggerConfig, LogContext } from './log-types.js';

/**
 * Structured logger that writes timestamped entries to pharaoh.log
 */
export class Logger {
  private readonly minLevel: LogLevel;

  constructor(
    private readonly fs: Filesystem,
    private readonly logPath: string,
    config?: LoggerConfig
  ) {
    this.minLevel = config?.minLevel ?? 'debug';
  }


  private shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] >= logLevelPriority[this.minLevel];
  }

  private async write(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    const entry = this.buildLogEntry(level, message, context);
    await this.fs.appendFile(this.logPath, entry);
  }

  private buildLogEntry(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = formatTimestamp(new Date());
    const contextStr = formatContext(context);
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}\n`;
  }

  /**
   * Log debug message (verbose internal state)
   */
  async debug(message: string, context?: LogContext): Promise<void> {
    if (this.shouldLog('debug')) {
      await this.write('debug', message, context);
    }
  }

  /**
   * Log info message (normal operations)
   */
  async info(message: string, context?: LogContext): Promise<void> {
    if (this.shouldLog('info')) {
      await this.write('info', message, context);
    }
  }

  /**
   * Log warning (recoverable errors)
   */
  async warn(message: string, context?: LogContext): Promise<void> {
    if (this.shouldLog('warn')) {
      await this.write('warn', message, context);
    }
  }

  /**
   * Log error (unrecoverable errors)
   */
  async error(message: string, context?: LogContext): Promise<void> {
    if (this.shouldLog('error')) {
      await this.write('error', message, context);
    }
  }
}
