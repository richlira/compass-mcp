import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readDataFile, writeDataFile } from '../utils/files.js';

export function addContextTools(server: McpServer) {
  server.tool(
    'save_context',
    "Save or update a project context file. Use when user says 'save this context for X', 'update the X context with...', 'guarda contexto de...'",
    {
      project: z.string().describe('Project name (used as filename, e.g. "cancun")'),
      content: z.string().describe('Markdown content for the project context'),
    },
    async ({ project, content }) => {
      const filename = `contexts/${project.toLowerCase().replace(/\s+/g, '-')}.md`;
      await writeDataFile(filename, content);
      return { content: [{ type: 'text', text: `Context saved for "${project}" at ${filename}` }] };
    },
  );

  server.tool(
    'get_context',
    "Read a project context file. Use when user references a project — 'let's work on Cancún', 'what's the status of the workshop?', 'contexto de...'",
    {
      project: z.string().describe('Project name'),
    },
    async ({ project }) => {
      const filename = `contexts/${project.toLowerCase().replace(/\s+/g, '-')}.md`;
      const content = await readDataFile(filename);
      if (!content) {
        return { content: [{ type: 'text', text: `No context file found for "${project}". Use save_context to create one.` }] };
      }
      return { content: [{ type: 'text', text: content }] };
    },
  );
}
