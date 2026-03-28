import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { addWorkspaceTools } from './tools/workspace.js';
import { addTaskTools } from './tools/tasks.js';
import { addContextTools } from './tools/contexts.js';

const server = new McpServer({
  name: 'compass',
  version: '2.0.0',
});

addWorkspaceTools(server);
addTaskTools(server);
addContextTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
