# Feature Plan: Rewrite /new-project as Native Claude Command

**Created:** 2026-01-09
**Status:** Planning
**Workflow:** /feature --plan-only

---

## Overview

Rewrite the `/new-project` command from a thin wrapper around `npm run create-project` to a fully native Claude command using `AskUserQuestion` for interactive prompts and `Write` for file creation.

---

## Research Summary

### Current Implementation

**scripts/create-project.js** (215 lines)
- Interactive CLI using `@inquirer/prompts`
- Dynamic template loading from `projects/_templates/*/template.json`
- EJS rendering for `index.html` generation
- Creates: `project.json`, `index.html`, `reference/` directory

**.claude/skills/new-project.md** (25 lines)
- Thin wrapper that executes `npm run create-project`
- No Claude-native interaction

### Templates Available

| Template | Features | Description |
|----------|----------|-------------|
| `base` | documents | Minimal with navbar + document browser |
| `gantt` | gantt, documents | Timeline/Gantt chart with task tracking |
| `gallery` | documents, gallery | Grid/list view of documents with previews |

### Patterns from Existing Commands

**From /feature and /commit:**
- YAML frontmatter with description
- Phase-based architecture with pause points
- Flags: `--yes`, `--skip-X`, `--plan-only`
- AskUserQuestion for batched prompts (1-4 questions)
- TodoWrite for progress tracking
- Quality gates that abort on issues

---

## Requirements

1. **Interactive prompts** - Use AskUserQuestion instead of terminal prompts
2. **Template discovery** - Dynamically load templates from `_templates/*/template.json`
3. **Slug generation** - Auto-generate from name, validate format and uniqueness
4. **File creation** - Create project.json, index.html, reference/ directory
5. **Feature toggles** - Per-template feature selection
6. **Backward compatibility** - Keep npm script working for terminal users

---

## Acceptance Criteria

- [ ] `/new-project` prompts for project name, slug, description, template, features
- [ ] Templates are loaded dynamically from filesystem
- [ ] Slug is validated (lowercase, alphanumeric, hyphens only)
- [ ] Slug uniqueness is checked against existing projects
- [ ] `project.json` is created with correct structure
- [ ] `index.html` is generated based on template
- [ ] `reference/` directory is created
- [ ] Command shows success message with project URL
- [ ] `npm run create-project` still works for terminal users

---

## Implementation Plan

### Step 1: Create Command File

Create `.claude/commands/new-project.md` with:
- YAML frontmatter (description)
- Workflow phases
- AskUserQuestion prompts specification
- File creation steps

### Step 2: Design Prompt Flow

**Question 1: Project Details**
```
Questions:
- Project name (text input)
- Description (optional text input)
```

**Question 2: Template Selection**
```
Options:
- base - Minimal with navbar + document browser
- gantt - Timeline/Gantt chart with task tracking
- gallery - Grid/list view of documents with previews
```

**Question 3: Features (per-template)**
```
Multi-select based on template.features
```

### Step 3: Template Loading

```
1. Glob: projects/_templates/*/template.json
2. Read each template.json
3. Build options for AskUserQuestion
```

### Step 4: Slug Generation & Validation

```
1. Generate slug from name: lowercase, replace spaces/special chars with hyphens
2. Validate format: /^[a-z0-9-]+$/
3. Check uniqueness: Glob projects/*/project.json, extract slugs
4. If conflict, append number or prompt for alternative
```

### Step 5: File Creation

**project.json:**
```json
{
  "name": "{name}",
  "slug": "{slug}",
  "description": "{description}",
  "template": "{template}",
  "created": "YYYY-MM-DD",
  "features": { ... },
  "customPage": false
}
```

**index.html:**
- Generate based on template type
- Include navbar, sidebar structure
- Reference project.json for dynamic content

**Directories:**
- Create `projects/{slug}/`
- Create `projects/{slug}/reference/`

### Step 6: Success Output

```
Project created!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: {name}
Slug: {slug}
Template: {template}
Features: {features}

Run `npm run dev` and visit:
http://localhost:5173/projects/{slug}/
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `.claude/commands/new-project.md` | CREATE | Full native command specification |
| `.claude/skills/new-project.md` | DELETE | Remove thin wrapper (superseded) |

---

## Risks & Considerations

1. **EJS templates not available** - Claude can't run EJS. Solution: Generate HTML directly based on template patterns.

2. **AskUserQuestion limitations** - Max 4 questions per call, 2-4 options per question. Solution: Multi-step flow if needed.

3. **Template evolution** - If templates change, command needs updating. Solution: Keep template discovery dynamic.

4. **Backward compatibility** - Users may still use `npm run create-project`. Solution: Keep Node CLI working.

---

## Testing Plan

1. Create test project with each template type
2. Verify project.json structure
3. Verify index.html renders correctly
4. Verify Vite auto-discovery works (`npm run dev`)
5. Verify feature toggles work correctly
6. Test slug validation edge cases (duplicates, special chars)

---

## Notes

- Keep Node CLI (`scripts/create-project.js`) as fallback for terminal users
- Command should work in both VSCode and terminal contexts
- Consider adding `--template` and `--name` flags for automation
