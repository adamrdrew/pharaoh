// Atomic status file writer
export async function writeStatus(fs, statusPath, status) {
    const tmpPath = `${statusPath}.tmp`;
    const content = JSON.stringify(status, null, 2);
    await fs.writeFile(tmpPath, content);
    await fs.rename(tmpPath, statusPath);
}
//# sourceMappingURL=status-writer.js.map