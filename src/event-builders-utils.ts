// Shared utilities for event builders

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function timestamp(): string {
  return new Date().toISOString();
}
