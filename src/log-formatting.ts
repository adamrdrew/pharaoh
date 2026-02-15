// Timestamp and context formatting utilities for logger

import type { LogContext } from './log-types.js';

/**
 * Format a Date as ISO-like timestamp
 */
export function formatTimestamp(now: Date): string {
  const datePart = formatDate(now);
  const timePart = formatTime(now);
  return `${datePart} ${timePart}`;
}

/**
 * Format date part (YYYY-MM-DD)
 */
export function formatDate(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time part (HH:MM:SS)
 */
export function formatTime(now: Date): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format context object as JSON string
 */
export function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }
  return ` ${JSON.stringify(context)}`;
}
