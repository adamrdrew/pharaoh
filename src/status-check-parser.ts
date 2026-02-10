// Parse progress.yaml and extract phase status with runtime validation

import * as yaml from 'js-yaml';
import type { StatusCheckResult } from './status-check.js';

export function parsePhaseStatus(yamlContent: string): StatusCheckResult {
  try {
    const parsed = yaml.load(yamlContent);
    return validateAndExtractStatus(parsed);
  } catch (err) {
    return { ok: false, error: `YAML parsing failed: ${String(err)}` };
  }
}

function validateAndExtractStatus(parsed: unknown): StatusCheckResult {
  if (!isValidStructure(parsed)) return buildStructureError();
  const status = parsed.phase.status;
  if (typeof status !== 'string') return buildStatusTypeError();
  return { ok: true, status };
}

function isValidStructure(value: unknown): value is { phase: { status: unknown } } {
  if (typeof value !== 'object' || value === null) return false;
  if (!('phase' in value)) return false;
  const maybePhase = value.phase;
  if (typeof maybePhase !== 'object' || maybePhase === null) return false;
  return 'status' in maybePhase;
}

function buildStructureError(): StatusCheckResult {
  return { ok: false, error: 'YAML missing phase.status field' };
}

function buildStatusTypeError(): StatusCheckResult {
  return { ok: false, error: 'phase.status is not a string' };
}
