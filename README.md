# 🧭 Compass MCP

**The missing bridge between Claude Chat, Cowork, and Code.**

Compass is an MCP server that gives Claude shared operational state across all three surfaces. Add a task in Chat, check it off in Code, filter by project in Cowork — same data, zero re-explaining.

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│   Chat    │    │  Cowork   │    │   Code    │
└─────┬─────┘    └─────┬─────┘    └─────┬─────┘
      │                │                │
      └────────┬───────┴────────┬───────┘
               │                │
       ┌───────▼────────────────▼───────┐
       │         Compass MCP            │
       │                                │
       │   ┌──────────────────────┐     │
       │   │  ~/compass-data/     │     │
       │   │  tasks.md            │     │
       │   │  contexts/           │     │
       │   └──────────────────────┘     │
       └────────────────────────────────┘
```

## Why?

Claude Chat, Cowork, and Code don't share state. Each session starts from zero. There's no way to ask in Chat "what did I finish in Code?" or tell Cowork "here's the context for this project" without re-explaining everything.

Compass fixes that. One MCP server, visible to all three surfaces, backed by plain markdown files.

**This is not another todo app.** It's the operational layer that connects how you think (Chat), how you execute (Cowork), and how you build (Code).

## Install

```bash
git clone https://github.com/richlira/compass-mcp.git
cd compass-mcp
npm install
npm run build
```

## Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "compass": {
      "command": "node",
      "args": ["/absolute/path/to/compass-mcp/build/index.js"]
    }
  }
}
```

Restart Claude Desktop. All three tabs (Chat, Cowork, Code) will see Compass.

## Usage

No commands to memorize. Just talk:

| You say | Compass does |
|---|---|
| "Set up my workspace" | `init_workspace` → creates `~/compass-data/` |
| "Add task: write copy for landing page, deadline April 5" | `add_task` → adds to `tasks.md` |
| "I finished the workshop slides" | `complete_task` → marks it done |
| "What's still pending?" | `get_tasks` → returns filtered tasks |
| "Save context for Impact Lab: April 18, hackathon format" | `save_context` → creates `contexts/impact-lab.md` |
| "What do we know about the workshop?" | `get_context` → reads `contexts/workshop.md` |

Works in English, Spanish, Spanglish — whatever. Claude matches your intent to the right tool automatically.

## Tools

### `init_workspace`
Creates `~/compass-data/` with `tasks.md` and `contexts/` directory. Safe to run multiple times.

### `add_task`
Adds a task to `tasks.md`.
- **title** (required) — what needs to be done
- **tags** — project or category tags (e.g. `["cancun", "marketing"]`)
- **deadline** — due date
- **section** — `"active"` (default) or `"backlog"`

### `complete_task`
Marks a task as completed in `tasks.md`.
- **title** (required) — task to complete (fuzzy matched)
- **notes** — optional completion notes

### `get_tasks`
Returns tasks filtered by status, tags, or deadline.
- **status** — `"active"`, `"backlog"`, `"completed"`, or `"all"`
- **tags** — filter by tags
- **deadline_before** — show tasks due before a date

### `save_context`
Creates or updates a project context file in `contexts/`.
- **project** (required) — project name (becomes the filename)
- **content** (required) — markdown content with project details

### `get_context`
Reads a project context file.
- **project** (required) — project name to look up

## Storage

Everything lives in `~/compass-data/`:

```
~/compass-data/
├── tasks.md        ← all tasks with status, tags, deadlines
└── contexts/
    ├── cancun.md   ← project-specific context
    ├── workshop.md
    └── ...
```

Plain markdown. Human-readable. Git-versionable. No database.

The workspace path is configurable via the `COMPASS_DATA_DIR` environment variable.

## How the three surfaces use Compass

**Chat** — your thinking space. Plan the day, add tasks, check status, save project context. Chat is where you decide.

**Cowork** — your execution space. Cowork reads the same tasks and contexts. It can check what's pending, mark things done as it works, and read project context to understand what to do.

**Code** — your building space. Code checks for build-related tasks, marks them complete when done, and reads project context for specs and decisions. Code is also where you maintain and improve Compass itself.

All three read and write the same `tasks.md` and `contexts/` — that's the bridge.

## Pro tip: combine with Google Calendar

If you have the Google Calendar connector enabled, Claude can combine Compass tasks with your calendar:

> "Check my tasks and my calendar for today, and block time for what I can get done"

Claude reads your tasks from Compass, finds free slots in your calendar, estimates duration, and creates focus blocks. No extra code needed — just Claude orchestrating two tools together.

## Requirements

- Node.js 18+
- Claude Desktop (macOS or Windows)
- Claude Pro, Max, Team, or Enterprise plan

## Development

```bash
# Build
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js

# Watch mode
npm run watch
```

## Philosophy

Compass is intentionally minimal. Six tools, two file types, zero database. Decisions, progress tracking, and daily recaps are left to Claude's memory — that's what it's good at. Compass only handles what Claude can't do alone: queryable task state and structured project context that persists across all surfaces.

If you need more, add it. If you don't, enjoy the simplicity.

## License

MIT

---

*Chat, Cowork, Code — and Compass.* 🧭
