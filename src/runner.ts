// SDK query runner for executing phases via ir-kat skill

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { PhaseResult } from './types.js';
import type { Logger } from './log.js';
import type { StatusManager } from './status.js';

/**
 * Configuration for phase execution
 */
export interface RunnerConfig {
  readonly cwd: string;
  readonly pluginPath: string;
  readonly model: string;
}

/**
 * Executes phases via the Claude Agent SDK
 */
export class PhaseRunner {
  constructor(
    private readonly logger: Logger,
    private readonly status: StatusManager,
    private readonly config: RunnerConfig
  ) {}

  /**
   * Run a phase via the ir-kat skill
   */
  async runPhase(
    pid: number,
    started: string,
    phasePrompt: string,
    phaseName?: string
  ): Promise<PhaseResult> {
    const name = phaseName ?? 'unnamed-phase';
    const startTime = Date.now();
    const phaseStarted = new Date().toISOString();

    await this.logger.info('Starting phase execution', { phase: name });
    await this.status.setBusy(pid, started, name, phaseStarted);

    const prompt = `Invoke /ir-kat with the following PHASE_PROMPT:\n\n${phasePrompt}`;

    const q = query({
      prompt,
      options: {
        cwd: this.config.cwd,
        model: this.config.model,
        plugins: [{ type: 'local', path: this.config.pluginPath }],
        settingSources: ['project'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        sandbox: {
          enabled: true,
          autoAllowBashIfSandboxed: true,
        },
        maxTurns: 200,
        persistSession: false,
        hooks: {
          PreToolUse: [
            {
              hooks: [
                async (input) => {
                  if (
                    input.hook_event_name === 'PreToolUse' &&
                    input.tool_name === 'AskUserQuestion'
                  ) {
                    await this.logger.info('Blocked AskUserQuestion', {
                      phase: name,
                    });
                    return {
                      continue: true,
                      decision: 'block',
                      systemMessage: 'Proceed with your best judgement',
                    };
                  }
                  return { continue: true };
                },
              ],
            },
          ],
        },
      },
    });

    let turns = 0;
    let costUsd = 0;

    for await (const message of q) {
      if (message.type === 'result') {
        const durationMs = Date.now() - startTime;

        if (message.subtype === 'success') {
          turns = message.num_turns;
          costUsd = message.total_cost_usd;

          await this.logger.info('Phase completed successfully', {
            phase: name,
            turns,
            costUsd,
            durationMs,
          });

          return {
            ok: true,
            costUsd,
            turns,
            durationMs,
          };
        } else {
          turns = message.num_turns;
          costUsd = message.total_cost_usd;
          const errors = message.errors.join('; ');

          await this.logger.error('Phase failed', {
            phase: name,
            subtype: message.subtype,
            errors,
            turns,
            costUsd,
          });

          if (message.subtype === 'error_max_turns') {
            return {
              ok: false,
              reason: 'max_turns',
              error: `Max turns reached: ${errors}`,
              costUsd,
              turns,
              durationMs,
            };
          }

          return {
            ok: false,
            reason: 'sdk_error',
            error: errors,
            costUsd,
            turns,
            durationMs,
          };
        }
      }

      if (message.type === 'assistant') {
        await this.logger.debug('Assistant message received', {
          phase: name,
        });
      }

      if (message.type === 'system' && message.subtype === 'status') {
        await this.logger.debug('SDK status', {
          phase: name,
          status: message.status,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    await this.logger.error('Phase ended without result', { phase: name });

    return {
      ok: false,
      reason: 'sdk_error',
      error: 'Query ended without result message',
      costUsd,
      turns,
      durationMs,
    };
  }
}
