// PR description builder for rich GitHub PR bodies
import path from 'path';
export async function buildPRDescription(cwd, phaseName, fs) {
    const phaseDir = resolvePhasePath(cwd, phaseName);
    const phaseContent = await readPhaseFile(fs, phaseDir);
    const stepsContent = await readStepsFile(fs, phaseDir);
    return formatDescription(phaseName, phaseContent, stepsContent);
}
function resolvePhasePath(cwd, phaseName) {
    return path.join(cwd, '.ushabti', 'phases', phaseName);
}
async function readPhaseFile(fs, phaseDir) {
    const phasePath = path.join(phaseDir, 'phase.md');
    const exists = await fs.exists(phasePath);
    if (!exists)
        return null;
    return fs.readFile(phasePath);
}
async function readStepsFile(fs, phaseDir) {
    const stepsPath = path.join(phaseDir, 'steps.md');
    const exists = await fs.exists(stepsPath);
    if (!exists)
        return null;
    return fs.readFile(stepsPath);
}
function formatDescription(phaseName, phaseContent, stepsContent) {
    if (!phaseContent)
        return buildFallbackDescription(phaseName);
    const intent = extractIntent(phaseContent);
    const scope = extractScope(phaseContent);
    const steps = extractSteps(stepsContent);
    return buildRichDescription(intent, scope, steps);
}
function buildFallbackDescription(phaseName) {
    return `## Phase ${phaseName}\n\nAutomated phase completion via Pharaoh.`;
}
function extractIntent(content) {
    const match = content.match(/## Intent\n\n([\s\S]*?)(?=\n## |$)/);
    return match ? match[1].trim() : '';
}
function extractScope(content) {
    const match = content.match(/## Scope\n\n([\s\S]*?)(?=\n## |$)/);
    return match ? match[1].trim() : '';
}
function extractSteps(content) {
    if (!content)
        return [];
    const stepMatches = content.matchAll(/## (S\d+: [^\n]+)/g);
    return Array.from(stepMatches, (m) => m[1]);
}
function buildRichDescription(intent, scope, steps) {
    const sections = [buildSummary(intent), buildScope(scope), buildSteps(steps)];
    return sections.filter((s) => s.length > 0).join('\n\n');
}
function buildSummary(intent) {
    return intent ? `## Summary\n\n${intent}` : '';
}
function buildScope(scope) {
    return scope ? `## Scope\n\n${scope}` : '';
}
function buildSteps(steps) {
    if (steps.length === 0)
        return '';
    const list = steps.map((s) => `- ${s}`).join('\n');
    return `## Steps Completed\n\n${list}`;
}
//# sourceMappingURL=pr-description-builder.js.map