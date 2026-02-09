// Tests for ProgressDebouncer

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressDebouncer } from '../src/event-debouncer.js';

describe('ProgressDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows first write immediately', () => {
    const debouncer = new ProgressDebouncer(5000);
    expect(debouncer.shouldWrite('tool-1')).toBe(true);
  });

  it('blocks second write within debounce window', () => {
    const debouncer = new ProgressDebouncer(5000);
    debouncer.shouldWrite('tool-1');
    debouncer.markWritten('tool-1');
    vi.advanceTimersByTime(4999);
    expect(debouncer.shouldWrite('tool-1')).toBe(false);
  });

  it('allows write after debounce window expires', () => {
    const debouncer = new ProgressDebouncer(5000);
    debouncer.shouldWrite('tool-1');
    debouncer.markWritten('tool-1');
    vi.advanceTimersByTime(5001);
    expect(debouncer.shouldWrite('tool-1')).toBe(true);
  });

  it('tracks separate tools independently', () => {
    const debouncer = new ProgressDebouncer(5000);
    debouncer.shouldWrite('tool-1');
    debouncer.markWritten('tool-1');
    expect(debouncer.shouldWrite('tool-2')).toBe(true);
  });

  it('requires markWritten to record timestamp', () => {
    const debouncer = new ProgressDebouncer(5000);
    debouncer.shouldWrite('tool-1');
    vi.advanceTimersByTime(6000);
    expect(debouncer.shouldWrite('tool-1')).toBe(true);
  });
});
