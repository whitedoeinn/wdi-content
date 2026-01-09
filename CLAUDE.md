# White Doe Inn Content (wdi-content)

Management tools and internal applications for White Doe Inn (Inspired Manteo Moments, Inc.).

## Tech Stack

- **Build**: Vite 7.x with TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI component library
- **Reactivity**: Alpine.js for lightweight interactivity
- **Charts**: Frappe Gantt for project timeline visualization

## Project Structure

```
├── index.html                 # Main landing page
├── public/                    # Static files (served as-is)
│   ├── expense-form.html      # Expense reimbursement form
│   └── expense-summary.html   # Expense report viewer
├── projects/                  # Document collections with custom presentation
│   ├── index.html             # Projects listing page
│   ├── _templates/            # Project templates (not served)
│   │   ├── base/              # Minimal template
│   │   ├── gantt/             # Gantt chart + timeline
│   │   └── gallery/           # Document gallery
│   └── kitchen-remodel/       # Example project
│       ├── project.json       # Project manifest
│       ├── index.html         # Project page
│       └── reference/         # Documents, receipts
├── scripts/
│   └── create-project.js      # Interactive project creation CLI
└── src/
    ├── main.ts                # Entry point - initializes Alpine.js
    ├── style.css              # Tailwind + DaisyUI configuration
    ├── gantt.ts               # Gantt chart functionality
    └── types/                 # TypeScript type definitions
```

## Commands

```bash
npm run dev            # Start development server
npm run build          # TypeScript check + Vite production build
npm run preview        # Preview production build locally
npm run create-project # Create a new project (interactive CLI)
```

## Projects System

Projects are self-contained document collections with optional visualizations.

### Creating a New Project

```bash
npm run create-project
```

Or use the Claude Code skill: `/new-project`

The CLI prompts for:
- Project name and slug
- Description (optional)
- Template: `base`, `gantt`, or `gallery`
- Feature toggles

### Project Structure

Each project has:
- `project.json` - Manifest with name, template, features
- `index.html` - Main page (generated from template or custom)
- `reference/` - Documents, receipts, images
- `src/` (optional) - Project-specific TypeScript

### Templates

| Template | Description |
|----------|-------------|
| `base` | Navbar + document sidebar + empty content area |
| `gantt` | Timeline/Gantt chart with task tracking |
| `gallery` | Grid/list view of documents with previews |

### Auto-Discovery

Vite automatically discovers projects by scanning `projects/*/project.json`. No manual configuration needed after creating a project.

## URL Structure

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/projects/` | Projects listing |
| `/projects/{slug}/` | Individual project |
| `/public/{file}.html` | Static files |
| `/{file}.html` | Symlinks to public/ (backward compat) |

## Development Notes

- **Auto-discovery**: Projects and public files are auto-discovered in `vite.config.ts`
- **Backward compatibility**: Symlinks at root point to `/public/` for existing URLs
- **Styling**: Most pages use DaisyUI; some (expense forms) use standalone CSS for print
- **Alpine.js**: Available globally via `window.Alpine`
- **Strict TypeScript**: Enabled with `noUnusedLocals`, `noUnusedParameters`
