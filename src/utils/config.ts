import path from 'node:path';
import os from 'node:os';

export const DATA_DIR = process.env.COMPASS_DATA_DIR || path.join(os.homedir(), 'compass-data');
export const CONTEXTS_DIR = path.join(DATA_DIR, 'contexts');
