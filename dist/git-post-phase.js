// Git post-phase commit and PR creation
import { buildPRDescription } from './pr-description-builder.js';
export async function finalizeGreenPhase(git, logger, phaseName, fs, cwd) {
    const isRepo = await checkIsGitRepo(git);
    if (!isRepo)
        return null;
    return performGitPostOperations(git, logger, phaseName, fs, cwd);
}
async function checkIsGitRepo(git) {
    const result = await git.isGitRepo();
    return result.ok && result.value;
}
async function performGitPostOperations(git, logger, phaseName, fs, cwd) {
    await stageAllChanges(git, logger);
    await commitChanges(git, logger, phaseName);
    await pushBranch(git, logger, phaseName);
    return createPullRequest(git, logger, phaseName, fs, cwd);
}
async function stageAllChanges(git, logger) {
    const result = await git.stageAll();
    if (result.ok)
        await logger.info('Staged all changes', {});
    else
        await logger.warn('Failed to stage changes', { error: result.error });
}
async function commitChanges(git, logger, phaseName) {
    const message = buildCommitMessage(phaseName);
    const result = await git.commit(message);
    if (result.ok)
        await logger.info('Committed changes', { phase: phaseName });
    else
        await logger.warn('Failed to commit changes', { error: result.error });
}
async function pushBranch(git, logger, phaseName) {
    const branchName = `pharaoh/${slugify(phaseName)}`;
    const result = await git.push(branchName);
    if (result.ok)
        await logger.info('Pushed branch', { branch: branchName });
    else
        await logger.warn('Failed to push branch', { error: result.error });
}
async function createPullRequest(git, logger, phaseName, fs, cwd) {
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
function buildCommitMessage(phaseName) {
    return `Phase ${phaseName} complete\n\nCo-Authored-By: Pharaoh <noreply@pharaoh>`;
}
function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
//# sourceMappingURL=git-post-phase.js.map