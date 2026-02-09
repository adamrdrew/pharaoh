// Tests for running cost calculation

import { describe, it, expect } from 'vitest';
import { calculateRunningCost } from '../src/cost-calculator.js';

describe('calculateRunningCost', () => {
  it('calculates cost with Opus 4 pricing', () => {
    const inputTokens = 1_000_000;
    const outputTokens = 1_000_000;
    const cost = calculateRunningCost(inputTokens, outputTokens);
    expect(cost).toBe(0.09);
  });

  it('calculates cost for small token counts', () => {
    const inputTokens = 1000;
    const outputTokens = 1000;
    const cost = calculateRunningCost(inputTokens, outputTokens);
    expect(cost).toBeCloseTo(0.00009, 6);
  });

  it('calculates cost with only input tokens', () => {
    const inputTokens = 1_000_000;
    const outputTokens = 0;
    const cost = calculateRunningCost(inputTokens, outputTokens);
    expect(cost).toBe(0.015);
  });

  it('calculates cost with only output tokens', () => {
    const inputTokens = 0;
    const outputTokens = 1_000_000;
    const cost = calculateRunningCost(inputTokens, outputTokens);
    expect(cost).toBe(0.075);
  });

  it('returns zero for zero tokens', () => {
    const cost = calculateRunningCost(0, 0);
    expect(cost).toBe(0);
  });
});
