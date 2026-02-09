// Git pre-phase validation and branch creation

import type { Logger } from './log.js';
import type { GitOperations } from './git.js';

export async function prepareGitEnvironment(
  git: GitOperations,
  logger: Logger,
  phaseName: string
): Promise<void> {
  const isRepo = await checkIsGitRepo(git);
  if (!isRepo) return;
  await performGitPreChecks(git, logger, phaseName);
}

async function checkIsGitRepo(git: GitOperations): Promise<boolean> {
  const result = await git.isGitRepo();
  return result.ok && result.value;
}

async function performGitPreChecks(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  const branchCheck = await verifyMainBranch(git, logger);
  if (!branchCheck) return;
  const cleanCheck = await verifyCleanWorkingTree(git, logger);
  if (!cleanCheck) return;
  await pullLatestChanges(git, logger);
  await createFeatureBranch(git, logger, phaseName);
}

async function verifyMainBranch(git: GitOperations, logger: Logger): Promise<boolean> {
  const result = await git.getCurrentBranch();
  if (!result.ok) {
    await logger.warn('Failed to get current branch', { error: result.error });
    return false;
  }
  const isMainBranch = result.value === 'main' || result.value === 'master';
  if (!isMainBranch) {
    await logger.warn('Not on main/master branch', { branch: result.value });
    return false;
  }
  return true;
}

async function verifyCleanWorkingTree(git: GitOperations, logger: Logger): Promise<boolean> {
  const result = await git.isClean();
  if (!result.ok || !result.value) {
    await logger.warn('Working tree is not clean', {});
    return false;
  }
  return true;
}

async function pullLatestChanges(git: GitOperations, logger: Logger): Promise<void> {
  const result = await git.pull();
  if (!result.ok) await logger.warn('Failed to pull latest changes', { error: result.error });
}

async function createFeatureBranch(git: GitOperations, logger: Logger, phaseName: string): Promise<void> {
  const branchName = `pharaoh/${slugify(phaseName)}`;
  const result = await git.createBranch(branchName);
  if (result.ok) await logger.info('Created feature branch', { branch: branchName });
  else await logger.warn('Failed to create feature branch', { branch: branchName, error: result.error });
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
