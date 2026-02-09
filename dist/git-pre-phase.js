// Git pre-phase validation and branch creation
export async function prepareGitEnvironment(git, logger, phaseName) {
    const isRepo = await checkIsGitRepo(git);
    if (!isRepo)
        return;
    await performGitPreChecks(git, logger, phaseName);
}
async function checkIsGitRepo(git) {
    const result = await git.isGitRepo();
    return result.ok && result.value;
}
async function performGitPreChecks(git, logger, phaseName) {
    const branchCheck = await verifyMainBranch(git, logger);
    if (!branchCheck)
        return;
    const cleanCheck = await verifyCleanWorkingTree(git, logger);
    if (!cleanCheck)
        return;
    await pullLatestChanges(git, logger);
    await createFeatureBranch(git, logger, phaseName);
}
async function verifyMainBranch(git, logger) {
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
async function verifyCleanWorkingTree(git, logger) {
    const result = await git.isClean();
    if (!result.ok || !result.value) {
        await logger.warn('Working tree is not clean', {});
        return false;
    }
    return true;
}
async function pullLatestChanges(git, logger) {
    const result = await git.pull();
    if (!result.ok)
        await logger.warn('Failed to pull latest changes', { error: result.error });
}
async function createFeatureBranch(git, logger, phaseName) {
    const branchName = `pharaoh/${slugify(phaseName)}`;
    const result = await git.createBranch(branchName);
    if (result.ok)
        await logger.info('Created feature branch', { branch: branchName });
    else
        await logger.warn('Failed to create feature branch', { branch: branchName, error: result.error });
}
function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
//# sourceMappingURL=git-pre-phase.js.map