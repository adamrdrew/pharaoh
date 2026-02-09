// Real filesystem implementation for production

import { promises as fs } from 'fs';
import type { Filesystem } from './status.js';

/**
 * Real filesystem implementation using Node's fs promises API
 */
export class RealFilesystem implements Filesystem {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }

  async appendFile(path: string, content: string): Promise<void> {
    await fs.appendFile(path, content, 'utf-8');
  }

  async mkdir(path: string, options?: { recursive: boolean }): Promise<void> {
    await fs.mkdir(path, options);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await fs.rename(oldPath, newPath);
  }

  async unlink(path: string): Promise<void> {
    await fs.unlink(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
