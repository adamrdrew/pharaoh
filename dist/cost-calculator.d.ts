/**
 * Calculate running cost from token usage using Opus 4 pricing heuristic.
 * Pricing: $15/MTok input, $75/MTok output
 * Note: This is a heuristic for Opus 4. Actual cost from SDK result is authoritative.
 */
export declare function calculateRunningCost(inputTokens: number, outputTokens: number): number;
//# sourceMappingURL=cost-calculator.d.ts.map