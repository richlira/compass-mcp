import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readDataFile, writeDataFile } from '../utils/files.js';
import { today } from '../utils/dates.js';

interface Task {
  title: string;
  completed: boolean;
  tags: string[];
  deadline?: string;
  created: string;
  completedDate?: string;
  raw: string;
}

function parseTask(line: string): Task | null {
  const match = line.match(/^- \[([ x])\] (.+)$/);
  if (!match) return null;

  const completed = match[1] === 'x';
  const rest = match[2];

  const parts = rest.split(' | ');
  const title = parts[0].trim();
  const meta: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const [key, ...vals] = parts[i].split(':');
    if (key && vals.length) meta[key.trim()] = vals.join(':').trim();
  }

  return {
    title,
    completed,
    tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
    deadline: meta.deadline,
    created: meta.created || today(),
    completedDate: meta.completed,
    raw: line,
  };
}

function formatTask(title: string, tags: string[], deadline?: string): string {
  let line = `- [ ] ${title}`;
  if (tags.length) line += ` | tags: ${tags.join(', ')}`;
  if (deadline) line += ` | deadline: ${deadline}`;
  line += ` | created: ${today()}`;
  return line;
}

function insertAfterHeading(content: string, heading: string, line: string): string {
  const idx = content.indexOf(heading);
  if (idx === -1) return content;
  const afterHeading = idx + heading.length;
  const nextChar = content[afterHeading] === '\n' ? afterHeading + 1 : afterHeading;
  const insertPoint = content[nextChar] === '\n' ? nextChar + 1 : nextChar;
  return content.slice(0, insertPoint) + line + '\n' + content.slice(insertPoint);
}

export function addTaskTools(server: McpServer) {
  server.tool(
    'add_task',
    'Add a new task to your task list.',
    {
      title: z.string().describe('Task title'),
      tags: z.string().optional().describe('Comma-separated tags, e.g. "cancun, marketing"'),
      deadline: z.string().optional().describe('Deadline in YYYY-MM-DD format'),
      section: z.string().optional().describe('Where to add: "active" (default) or "backlog"'),
    },
    async ({ title, tags, deadline, section }) => {
      let content = await readDataFile('tasks.md');
      if (!content) content = '# Tasks\n\n## Active\n\n## Backlog\n';

      const tagList = tags ? tags.split(',').map(t => t.trim()) : [];
      const taskLine = formatTask(title, tagList, deadline);
      const heading = section === 'backlog' ? '## Backlog' : '## Active';
      content = insertAfterHeading(content, heading, taskLine);

      await writeDataFile('tasks.md', content);
      return { content: [{ type: 'text', text: `Task added: ${taskLine}` }] };
    },
  );

  server.tool(
    'complete_task',
    'Mark a task as complete.',
    {
      title: z.string().describe('Task title or partial match'),
      notes: z.string().optional().describe('Optional completion notes'),
    },
    async ({ title, notes }) => {
      let content = await readDataFile('tasks.md');
      if (!content) return { content: [{ type: 'text', text: 'No tasks file found. Run init_workspace first.' }] };

      const lines = content.split('\n');
      const searchLower = title.toLowerCase();
      let found = false;
      let matchedTitle = '';

      for (let i = 0; i < lines.length; i++) {
        const task = parseTask(lines[i]);
        if (task && !task.completed && task.title.toLowerCase().includes(searchLower)) {
          lines[i] = lines[i]
            .replace('- [ ]', '- [x]')
            .replace(/ \| created:/, ` | completed: ${today()} | created:`);
          found = true;
          matchedTitle = task.title;
          break;
        }
      }

      if (!found) {
        return { content: [{ type: 'text', text: `No active task matching "${title}" found.` }] };
      }

      await writeDataFile('tasks.md', lines.join('\n'));
      return { content: [{ type: 'text', text: `Completed: "${matchedTitle}"${notes ? ' — ' + notes : ''}` }] };
    },
  );

  server.tool(
    'get_tasks',
    'Get tasks filtered by status, tags, or deadline.',
    {
      status: z.string().optional().describe('Filter: "active" (default), "backlog", "completed", or "all"'),
      tags: z.string().optional().describe('Comma-separated tags to filter by'),
      deadline_before: z.string().optional().describe('Show tasks due before this date (YYYY-MM-DD)'),
    },
    async ({ status, tags, deadline_before }) => {
      const content = await readDataFile('tasks.md');
      if (!content) return { content: [{ type: 'text', text: 'No tasks file found. Run init_workspace first.' }] };

      const lines = content.split('\n');
      let currentSection = '';
      const tasks: (Task & { section: string })[] = [];

      for (const line of lines) {
        if (line.startsWith('## ')) currentSection = line.replace('## ', '').toLowerCase();
        const task = parseTask(line);
        if (task) tasks.push({ ...task, section: currentSection });
      }

      let filtered = tasks;

      const filterStatus = status || 'active';
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed') {
          filtered = filtered.filter(t => t.completed);
        } else {
          filtered = filtered.filter(t => !t.completed && t.section === filterStatus);
        }
      }

      if (tags) {
        const tagList = tags.split(',').map(t => t.trim());
        filtered = filtered.filter(t => tagList.some(tag => t.tags.includes(tag)));
      }

      if (deadline_before) {
        filtered = filtered.filter(t => t.deadline && t.deadline <= deadline_before);
      }

      if (filtered.length === 0) {
        return { content: [{ type: 'text', text: 'No tasks match your filters.' }] };
      }

      const output = filtered.map(t => t.raw).join('\n');
      return { content: [{ type: 'text', text: output }] };
    },
  );
}
