import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './config.js';

export async function readDataFile(filename: string): Promise<string> {
  const filepath = path.join(DATA_DIR, filename);
  try {
    return await fs.readFile(filepath, 'utf-8');
  } catch {
    return '';
  }
}

export async function writeDataFile(filename: string, content: string): Promise<void> {
  const filepath = path.join(DATA_DIR, filename);
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content, 'utf-8');
}

export async function fileExists(filename: string): Promise<boolean> {
  const filepath = path.join(DATA_DIR, filename);
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}
