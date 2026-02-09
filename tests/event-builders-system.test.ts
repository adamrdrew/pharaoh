// Tests for system and result event builders

import { describe, it, expect } from 'vitest';
import { buildSystemInitEvent, buildSystemStatusEvent, buildResultEvent, buildErrorEvent } from '../src/event-builders-system.js';

describe('buildSystemInitEvent', () => {
  it('creates init event with SDK metadata', () => {
    const message = { type: 'system' as const, subtype: 'init', model: 'opus-4', tools: [{}, {}], plugins: [{}] };
    const event = buildSystemInitEvent(message);
    expect(event.type).toBe('status');
    expect(event.summary).toBe('SDK initialized');
    expect(event.detail?.model).toBe('opus-4');
    expect(event.detail?.tools_count).toBe(2);
    expect(event.detail?.plugins_count).toBe(1);
  });

  it('handles missing optional fields', () => {
    const message = { type: 'system' as const, subtype: 'init' };
    const event = buildSystemInitEvent(message);
    expect(event.detail?.model).toBeUndefined();
    expect(event.detail?.tools_count).toBeUndefined();
    expect(event.detail?.plugins_count).toBeUndefined();
  });
});

describe('buildSystemStatusEvent', () => {
  it('creates status event with status string', () => {
    const message = { type: 'system' as const, subtype: 'status', status: 'Processing' };
    const event = buildSystemStatusEvent(message);
    expect(event.type).toBe('status');
    expect(event.summary).toBe('Processing');
    expect(event.detail?.status).toBe('Processing');
  });

  it('uses default summary when status missing', () => {
    const message = { type: 'system' as const, subtype: 'status' };
    const event = buildSystemStatusEvent(message);
    expect(event.summary).toBe('Status update');
  });
});

describe('buildResultEvent', () => {
  it('creates result event with metrics', () => {
    const message = { type: 'result' as const, subtype: 'success', num_turns: 5, total_cost_usd: 1.25, errors: [] };
    const event = buildResultEvent(message);
    expect(event.type).toBe('result');
    expect(event.summary).toBe('Phase complete: 5 turns, $1.25');
    expect(event.detail?.turns).toBe(5);
    expect(event.detail?.cost_usd).toBe(1.25);
  });

  it('formats cost to two decimal places', () => {
    const message = { type: 'result' as const, subtype: 'success', num_turns: 10, total_cost_usd: 0.123456, errors: [] };
    const event = buildResultEvent(message);
    expect(event.summary).toBe('Phase complete: 10 turns, $0.12');
  });
});

describe('buildErrorEvent', () => {
  it('creates error event with error list', () => {
    const message = { type: 'result' as const, subtype: 'error', num_turns: 3, total_cost_usd: 0.5, errors: ['Error 1', 'Error 2'] };
    const event = buildErrorEvent(message);
    expect(event.type).toBe('error');
    expect(event.summary).toBe('Error 1; Error 2');
    expect(event.detail?.errors).toEqual(['Error 1', 'Error 2']);
    expect(event.detail?.turns).toBe(3);
    expect(event.detail?.cost_usd).toBe(0.5);
  });

  it('truncates long error summary to 200 characters', () => {
    const longError = 'x'.repeat(250);
    const message = { type: 'result' as const, subtype: 'error', num_turns: 1, total_cost_usd: 0.1, errors: [longError] };
    const event = buildErrorEvent(message);
    expect(event.summary.length).toBe(203);
    expect(event.summary.endsWith('...')).toBe(true);
  });
});
