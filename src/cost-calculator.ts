// Token-based cost calculation

/**
 * Calculate running cost from token usage using Opus 4 pricing heuristic.
 * Pricing: $15/MTok input, $75/MTok output
 * Note: This is a heuristic for Opus 4. Actual cost from SDK result is authoritative.
 */
export function calculateRunningCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens * 0.015) / 1_000_000;
  const outputCost = (outputTokens * 0.075) / 1_000_000;
  return roundToSixDecimals(inputCost + outputCost);
}

function roundToSixDecimals(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
