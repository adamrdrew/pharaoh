// Git post-phase commit and PR creation

import type { Logger } from './log.js';
import type { GitOperations } from './git.js';
import type { Filesystem } from './status.js';
import { buildPRDescription } from './pr-description-builder.js';

export async function finalizeGreenPhase(
  git: GitOperations,
  logger: Logger,
  phaseName: string,
  fs: Filesystem,
  cwd: string
): Promise<string | null> {
  const isRepo = await checkIsGitRepo(git);
  if (!isRepo) return null;
  return performGitPostOperations(git, logger, phaseName, fs, cwd);
}

async function checkIsGitRepo(git: GitOperations): Promise<boolean> {
  const result = await git.isGitRepo();
  return result.ok && result.value;
}

async function performGitPostOperations(
  git: GitOperations,
  logger: Logger,
  phaseName: string,
  fs: Filesystem,
  cwd: string
): Promise<string | null> {
  await stageAllChanges(git, logger);
  await commitChanges(git, logger, phaseName);
  await pushBranch(git, logger, phaseName);
  return createPullRequest(git, logger, phaseName, fs, cwd);
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

async function createPullRequest(
  git: GitOperations,
  logger: Logger,
  phaseName: string,
  fs: Filesystem,
  cwd: string
): Promise<string | null> {
  const title = `Phase ${phaseName}`;
  const body = await buildPRDescription(cwd, phaseName, fs);
  const result = await git.openPR(title, body);
  if (!result.ok) {
    await logger.info('PR creation skipped', { reason: result.error });
    return null;
  }
  await logger.info('Opened pull request', { phase: phaseName, url: result.value });
  return result.value;
}

function buildCommitMessage(phaseName: string): string {
  return `Phase ${phaseName} complete\n\nCo-Authored-By: Pharaoh <noreply@pharaoh>`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
