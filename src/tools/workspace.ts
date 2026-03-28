import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'node:fs/promises';
import { DATA_DIR, CONTEXTS_DIR } from '../utils/config.js';
import { fileExists, writeDataFile } from '../utils/files.js';

const TEMPLATES: Record<string, string> = {
  'tasks.md': `# Tasks

## Active

## Backlog
`,
};

export function addWorkspaceTools(server: McpServer) {
  server.tool(
    'init_workspace',
    "Initialize the Compass workspace. Creates ~/compass-data/ with tasks.md and contexts/. Safe to run multiple times — won't overwrite existing files.",
    {},
    async () => {
      await fs.mkdir(CONTEXTS_DIR, { recursive: true });

      const created: string[] = [];
      for (const [filename, template] of Object.entries(TEMPLATES)) {
        if (!(await fileExists(filename))) {
          await writeDataFile(filename, template);
          created.push(filename);
        }
      }

      const msg = created.length > 0
        ? `Workspace initialized at ${DATA_DIR}. Created: ${created.join(', ')}`
        : `Workspace already set up at ${DATA_DIR}. All files exist.`;

      return { content: [{ type: 'text', text: msg }] };
    },
  );
}
