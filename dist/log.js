// Structured logger for pharaoh.log
/**
 * Structured logger that writes timestamped entries to pharaoh.log
 */
export class Logger {
    fs;
    logPath;
    constructor(fs, logPath) {
        this.fs = fs;
        this.logPath = logPath;
    }
    formatTimestamp() {
        const now = new Date();
        const datePart = this.formatDate(now);
        const timePart = this.formatTime(now);
        return `${datePart} ${timePart}`;
    }
    formatDate(now) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    formatTime(now) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    /**
     * Format context object as JSON string
     */
    formatContext(context) {
        if (!context || Object.keys(context).length === 0) {
            return '';
        }
        return ` ${JSON.stringify(context)}`;
    }
    async write(level, message, context) {
        const entry = this.buildLogEntry(level, message, context);
        await this.fs.appendFile(this.logPath, entry);
    }
    buildLogEntry(level, message, context) {
        const timestamp = this.formatTimestamp();
        const contextStr = this.formatContext(context);
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}\n`;
    }
    /**
     * Log debug message (verbose internal state)
     */
    async debug(message, context) {
        await this.write('debug', message, context);
    }
    /**
     * Log info message (normal operations)
     */
    async info(message, context) {
        await this.write('info', message, context);
    }
    /**
     * Log warning (recoverable errors)
     */
    async warn(message, context) {
        await this.write('warn', message, context);
    }
    /**
     * Log error (unrecoverable errors)
     */
    async error(message, context) {
        await this.write('error', message, context);
    }
}
//# sourceMappingURL=log.js.map