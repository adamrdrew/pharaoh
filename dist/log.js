// Structured logger for pharaoh.log
import { logLevelPriority } from './log-types.js';
import { formatTimestamp, formatContext } from './log-formatting.js';
/**
 * Structured logger that writes timestamped entries to pharaoh.log
 */
export class Logger {
    fs;
    logPath;
    minLevel;
    constructor(fs, logPath, config) {
        this.fs = fs;
        this.logPath = logPath;
        this.minLevel = config?.minLevel ?? 'debug';
    }
    shouldLog(level) {
        return logLevelPriority[level] >= logLevelPriority[this.minLevel];
    }
    async write(level, message, context) {
        const entry = this.buildLogEntry(level, message, context);
        await this.fs.appendFile(this.logPath, entry);
    }
    buildLogEntry(level, message, context) {
        const timestamp = formatTimestamp(new Date());
        const contextStr = formatContext(context);
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}\n`;
    }
    /**
     * Log debug message (verbose internal state)
     */
    async debug(message, context) {
        if (this.shouldLog('debug')) {
            await this.write('debug', message, context);
        }
    }
    /**
     * Log info message (normal operations)
     */
    async info(message, context) {
        if (this.shouldLog('info')) {
            await this.write('info', message, context);
        }
    }
    /**
     * Log warning (recoverable errors)
     */
    async warn(message, context) {
        if (this.shouldLog('warn')) {
            await this.write('warn', message, context);
        }
    }
    /**
     * Log error (unrecoverable errors)
     */
    async error(message, context) {
        if (this.shouldLog('error')) {
            await this.write('error', message, context);
        }
    }
}
//# sourceMappingURL=log.js.map