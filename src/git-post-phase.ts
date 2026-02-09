// Git post-phase commit and PR creation

import type { Logger } from './log.js';
import type { GitOperations } from './git.js';

export async function finalizeGreenPhase(
  git: GitOperations,
  logger: Logger,
  phaseName: string
): Promise<void> {
  const isRepo = await checkIsGitRepo(git);
  if (!isRepo) return;
  await performGitPostOperations(git, logger, phaseName);
}

async function checkIsGitRepo(git: GitOperations): Promise<boolean> {
  const result = await git.isGitRepo();
  return result.ok && result.value;
}

async function performGitPostOperations(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  await stageAllChanges(git, logger);
  await commitChanges(git, logger, phaseName);
  await pushBranch(git, logger, phaseName);
  await createPullRequest(git, logger, phaseName);
}

async function stageAllChanges(git: GitOperations, logger: Logger): Promise<void> {
  const result = await git.stageAll();
  if (result.ok) await logger.info('Staged all changes', {});
  else await logger.warn('Failed to stage changes', { error: result.error });
}

async function commitChanges(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  const message = buildCommitMessage(phaseName);
  const result = await git.commit(message);
  if (result.ok) await logger.info('Committed changes', { phase: phaseName });
  else await logger.warn('Failed to commit changes', { error: result.error });
}

async function pushBranch(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  const branchName = `pharaoh/${slugify(phaseName)}`;
  const result = await git.push(branchName);
  if (result.ok) await logger.info('Pushed branch', { branch: branchName });
  else await logger.warn('Failed to push branch', { error: result.error });
}

async function createPullRequest(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  const title = `Phase ${phaseName}`;
  const body = buildPRBody(phaseName);
  const result = await git.openPR(title, body);
  if (result.ok) await logger.info('Opened pull request', { phase: phaseName });
  else await logger.info('PR creation skipped', { reason: result.error });
}

function buildCommitMessage(phaseName: string): string {
  return `Phase ${phaseName} complete\n\nCo-Authored-By: Pharaoh <noreply@pharaoh>`;
}

function buildPRBody(phaseName: string): string {
  return `## Phase ${phaseName}\n\nAutomated phase completion via Pharaoh.`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
