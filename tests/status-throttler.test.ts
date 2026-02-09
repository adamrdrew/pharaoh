// Tests for StatusThrottler

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatusThrottler } from '../src/status-throttler.js';

describe('StatusThrottler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows first write immediately', () => {
    const throttler = new StatusThrottler(5000);
    expect(throttler.shouldWrite()).toBe(true);
  });

  it('blocks second write within throttle window', () => {
    const throttler = new StatusThrottler(5000);
    throttler.shouldWrite();
    vi.advanceTimersByTime(4999);
    expect(throttler.shouldWrite()).toBe(false);
  });

  it('allows write after throttle window expires', () => {
    const throttler = new StatusThrottler(5000);
    throttler.shouldWrite();
    vi.advanceTimersByTime(5001);
    expect(throttler.shouldWrite()).toBe(true);
  });

  it('records timestamp automatically on shouldWrite', () => {
    const throttler = new StatusThrottler(5000);
    throttler.shouldWrite();
    vi.advanceTimersByTime(4500);
    expect(throttler.shouldWrite()).toBe(false);
  });
});
