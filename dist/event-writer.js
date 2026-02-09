// Event writer for structured event capture
/**
 * Writes events to .pharaoh/events.jsonl in append-only JSON Lines format
 */
export class EventWriter {
    fs;
    eventsPath;
    constructor(fs, eventsPath) {
        this.fs = fs;
        this.eventsPath = eventsPath;
    }
    async write(event) {
        const line = JSON.stringify(event) + '\n';
        await this.fs.appendFile(this.eventsPath, line);
    }
    async clear() {
        await this.fs.writeFile(this.eventsPath, '');
    }
}
//# sourceMappingURL=event-writer.js.map