// Structured logger for service.log

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
 * Structured logger that writes timestamped entries to service.log
 */
export class Logger {
  constructor(
    private readonly fs: Filesystem,
    private readonly logPath: string
  ) {}

  /**
   * Format timestamp for log entry
   */
  private formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format context object as JSON string
   */
  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return '';
    }
    return ` ${JSON.stringify(context)}`;
  }

  /**
   * Write log entry to file
   */
  private async write(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): Promise<void> {
    const timestamp = this.formatTimestamp();
    const levelUpper = level.toUpperCase();
    const contextStr = this.formatContext(context);
    const entry = `[${timestamp}] [${levelUpper}] ${message}${contextStr}\n`;

    const exists = await this.fs.exists(this.logPath);
    if (exists) {
      const current = await this.fs.readFile(this.logPath);
      await this.fs.writeFile(this.logPath, current + entry);
    } else {
      await this.fs.writeFile(this.logPath, entry);
    }
  }

  /**
   * Log debug message (verbose internal state)
   */
  async debug(message: string, context?: LogContext): Promise<void> {
    await this.write('debug', message, context);
  }

  /**
   * Log info message (normal operations)
   */
  async info(message: string, context?: LogContext): Promise<void> {
    await this.write('info', message, context);
  }

  /**
   * Log warning (recoverable errors)
   */
  async warn(message: string, context?: LogContext): Promise<void> {
    await this.write('warn', message, context);
  }

  /**
   * Log error (unrecoverable errors)
   */
  async error(message: string, context?: LogContext): Promise<void> {
    await this.write('error', message, context);
  }
}
