// Server initialization and startup
import process from 'node:process';
import path from 'node:path';
import { RealFilesystem } from './filesystem.js';
import { registerShutdownHandlers } from './shutdown.js';
import { buildPaths } from './server-paths.js';
import { initializeDependencies } from './server-deps.js';
import { startServer } from './server-startup.js';
export async function serve(config) {
    const paths = buildPaths(process.cwd());
    const fs = new RealFilesystem();
    await prepareServer(fs, paths, config);
    await launchServer(fs, paths, config);
}
async function prepareServer(fs, paths, config) {
    await validatePluginPath(fs, config.pluginPath);
    await ensureDirectories(fs, paths);
}
async function launchServer(fs, paths, config) {
    const dependencies = await initializeDependencies(fs, paths, config);
    registerShutdownHandlers(dependencies);
    await startServer(dependencies, paths);
}
async function validatePluginPath(fs, pluginPath) {
    const exists = await fs.exists(pluginPath);
    if (!exists) {
        console.error(`Error: Plugin path does not exist: ${pluginPath}`);
        process.exit(1);
    }
}
async function ensureDirectories(fs, paths) {
    await fs.mkdir(path.join(paths.cwd, '.pharaoh'), { recursive: true });
    await fs.mkdir(paths.dispatchPath, { recursive: true });
}
//# sourceMappingURL=server.js.map