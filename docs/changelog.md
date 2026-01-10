# Changelog

## 2026-01-10

### Added
- **Dynamic home page** - Home page (/) now displays all projects and tools dynamically
- **Dynamic projects listing** - Projects page (/projects/) fetches from auto-generated manifest
- **Manifest generation plugin** - Vite plugin generates `projects/_manifest.json` at build time
- **Dev mode watchers** - Manifest regenerates on project.json changes (add, modify, delete)

### Changed
- Home page now has Projects and Tools sections with responsive card grids
- Projects listing fetches from manifest instead of hardcoded array
- Added cross-platform path handling and error logging to Vite config

## 2026-01-09

### Added
- **Native /new-project command** - Rewrote project creation as native Claude command with AskUserQuestion prompts instead of npm CLI wrapper
  - Flags: `--yes`, `--template`, `--dry-run`
  - Pausepoint confirmation before file creation
  - Comprehensive examples and error handling docs
- **deck-addition project** - Test project created to validate new command workflow
- **Feature planning system** - Added `plans/` directory for feature implementation plans

### Changed
- Moved `/new-project` from `.claude/skills/` to `.claude/commands/`
- Command now references `_templates/` instead of duplicating HTML

### Removed
- `.claude/skills/new-project.md` thin wrapper (replaced by native command)
