// Tests for status setter functions

import { describe, it, expect } from 'vitest';
import { buildIdleStatus, buildBusyStatus, buildDoneStatus, buildBlockedStatus } from '../src/status-setters.js';

describe('buildIdleStatus', () => {
  it('includes all required metadata fields', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 5,
    };
    const status = buildIdleStatus(input);
    expect(status).toEqual({
      status: 'idle',
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 5,
    });
  });

  it('does not include gitBranch field', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    };
    const status = buildIdleStatus(input);
    expect(status).not.toHaveProperty('gitBranch');
  });
});

describe('buildBusyStatus', () => {
  it('includes all metadata fields including gitBranch', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      turnsElapsed: 3,
      runningCostUsd: 0.05,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 2,
      gitBranch: 'pharaoh/test-phase',
    };
    const status = buildBusyStatus(input);
    expect(status).toEqual({
      status: 'busy',
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      turnsElapsed: 3,
      runningCostUsd: 0.05,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 2,
      gitBranch: 'pharaoh/test-phase',
    });
  });
});

describe('buildDoneStatus', () => {
  it('includes all metadata fields except gitBranch', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      costUsd: 0.15,
      turns: 10,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 3,
    };
    const status = buildDoneStatus(input);
    expect(status).toEqual({
      status: 'done',
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      costUsd: 0.15,
      turns: 10,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 3,
    });
  });

  it('does not include gitBranch field', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      costUsd: 0.15,
      turns: 10,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 1,
    };
    const status = buildDoneStatus(input);
    expect(status).not.toHaveProperty('gitBranch');
  });
});

describe('buildBlockedStatus', () => {
  it('includes all metadata fields except gitBranch', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      error: 'Phase failed',
      costUsd: 0.10,
      turns: 5,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    };
    const status = buildBlockedStatus(input);
    expect(status).toEqual({
      status: 'blocked',
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      error: 'Phase failed',
      costUsd: 0.10,
      turns: 5,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    });
  });

  it('does not include gitBranch field', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'test-phase',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      error: 'Phase failed',
      costUsd: 0.10,
      turns: 5,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    };
    const status = buildBlockedStatus(input);
    expect(status).not.toHaveProperty('gitBranch');
  });
});

describe('phasesCompleted counter behavior', () => {
  it('counter starts at 0 for idle', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    };
    const status = buildIdleStatus(input);
    expect(status.phasesCompleted).toBe(0);
  });

  it('counter increments on done transition', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'phase-1',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      costUsd: 0.15,
      turns: 10,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 1,
    };
    const status = buildDoneStatus(input);
    expect(status.phasesCompleted).toBe(1);
  });

  it('counter does not increment on blocked transition', () => {
    const input = {
      pid: 12345,
      started: '2025-01-01T00:00:00Z',
      phase: 'phase-1',
      phaseStarted: '2025-01-01T01:00:00Z',
      phaseCompleted: '2025-01-01T02:00:00Z',
      error: 'Failed',
      costUsd: 0.10,
      turns: 5,
      pharaohVersion: '1.0.0',
      ushabtiVersion: '2.0.0',
      model: 'claude-opus-4',
      cwd: '/project',
      phasesCompleted: 0,
    };
    const status = buildBlockedStatus(input);
    expect(status.phasesCompleted).toBe(0);
  });
});
