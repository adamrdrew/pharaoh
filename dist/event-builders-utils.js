// Shared utilities for event builders
export function truncate(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
export function timestamp() {
    return new Date().toISOString();
}
//# sourceMappingURL=event-builders-utils.js.map