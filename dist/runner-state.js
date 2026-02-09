// Runner state management
import { calculateRunningCost } from './cost-calculator.js';
import { isAssistantMessage, isResultMessage } from './runner-guards.js';
export function updateState(message, state) {
    if (isAssistantMessage(message))
        updateAssistantMetrics(message, state);
    if (isResultMessage(message))
        updateResultMetrics(message, state);
}
function updateAssistantMetrics(msg, state) {
    state.messageCounter++;
    state.turnsElapsed = state.messageCounter;
    accumulateTokens(msg.message.usage, state);
}
function accumulateTokens(usage, state) {
    if (usage) {
        state.inputTokens += usage.input_tokens;
        state.outputTokens += usage.output_tokens;
        state.runningCostUsd = calculateRunningCost(state.inputTokens, state.outputTokens);
    }
}
function updateResultMetrics(msg, state) {
    if (msg.num_turns !== undefined && msg.total_cost_usd !== undefined) {
        state.turns = msg.num_turns;
        state.costUsd = msg.total_cost_usd;
    }
}
//# sourceMappingURL=runner-state.js.map