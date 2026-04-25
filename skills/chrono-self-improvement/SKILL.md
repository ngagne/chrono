---
name: chrono-self-improvement
description: "Capture reusable learnings, errors, and corrections as part of the Chrono workflow. Use when a task uncovers a non-obvious fix, the user corrects the agent, a command or tool fails in a meaningful way, a project convention is discovered, or a recurring solution should be promoted into repo instructions or a reusable skill. Review existing learnings before major implementation work."
---

# Chrono Self-Improvement

You are a WORKFLOW IMPROVEMENT AGENT supporting the Chrono planning and execution loop.

Chrono's built-in planning and execution skills are intentionally reusable. This skill captures
durable lessons discovered while using them so future sessions start with better local context
instead of rediscovering the same fixes.

Your role is to record reusable knowledge, keep the learning backlog organized, and promote stable
patterns into durable project guidance.

Capture durable lessons from real work so later GitHub Copilot sessions start with better local context instead of rediscovering the same fixes.

## Quick Reference

| Situation | Action |
|-----------|--------|
| Command or tool fails in a reusable way | Append an entry to `.chrono/learnings/ERRORS.md` |
| User corrects the agent | Append an entry to `.chrono/learnings/LEARNINGS.md` with category `correction` |
| A project convention or better workflow is discovered | Append an entry to `.chrono/learnings/LEARNINGS.md` with category `best_practice` |
| The user asks for a missing capability | Append an entry to `.chrono/learnings/FEATURE_REQUESTS.md` |
| A learning should shape future agent behavior | Promote it to `AGENTS.md`, `.github/copilot-instructions.md`, or `/memories/repo` |
| A resolved learning is broadly reusable | Extract it into a new skill with `node skills/chrono-self-improvement/scripts/extract-skill.js <skill-name>` |

## What This Skill Optimizes

Use this skill to keep a lightweight feedback loop around actual implementation work:

1. Log high-value mistakes and discoveries immediately.
2. Distill recurring learnings into durable project guidance.
3. Extract broadly useful patterns into reusable skills.

This skill is written for GitHub Copilot workflows in VS Code. GitHub Copilot supports hook
configuration for Copilot CLI and the Copilot cloud agent, but this skill must still work well
when used explicitly inside normal implementation flow and when hooks are not configured.

## Project-Local Artifacts

Store captured knowledge in a project-local `.chrono/learnings/` directory:

```text
.chrono/
  learnings/
  LEARNINGS.md
  ERRORS.md
  FEATURE_REQUESTS.md
```

Create the directory if it does not exist:

```bash
mkdir -p .chrono/learnings
```

## Logging Format

### Learning Entry

Append to `.chrono/learnings/LEARNINGS.md`:

```markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
One-line description of what was learned

### Details
Full context: what happened, what was wrong, what is correct now

### Suggested Action
Specific fix or improvement to make

### Metadata
- Source: conversation | error | user_feedback | investigation
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- See Also: LRN-20250110-001 (optional)
- Pattern-Key: simplify.dead_code | harden.input_validation (optional)
- Recurrence-Count: 1 (optional)
- First-Seen: 2025-01-15 (optional)
- Last-Seen: 2025-01-15 (optional)

---
```

### Error Entry

Append to `.chrono/learnings/ERRORS.md`:

```markdown
## [ERR-YYYYMMDD-XXX] command_or_tool_name

**Logged**: ISO-8601 timestamp
**Priority**: high
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
Brief description of what failed

### Error
```
Actual error message or output
```

### Context
- Command or operation attempted
- Input or parameters used
- Environment details if relevant

### Suggested Fix
If identifiable, what might resolve this

### Metadata
- Reproducible: yes | no | unknown
- Related Files: path/to/file.ext
- See Also: ERR-20250110-001 (optional)

---
```

### Feature Request Entry

Append to `.chrono/learnings/FEATURE_REQUESTS.md`:

```markdown
## [FEAT-YYYYMMDD-XXX] capability_name

**Logged**: ISO-8601 timestamp
**Priority**: medium
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Requested Capability
What the user wanted to do

### User Context
Why they needed it, what problem they are solving

### Complexity Estimate
simple | medium | complex

### Suggested Implementation
How this could be built, what it might extend

### Metadata
- Frequency: first_time | recurring
- Related Features: existing_feature_name

---
```

## ID Generation

Format: `TYPE-YYYYMMDD-XXX`

- `TYPE`: `LRN`, `ERR`, or `FEAT`
- `YYYYMMDD`: current date
- `XXX`: sequential number or short unique suffix

Examples: `LRN-20260424-001`, `ERR-20260424-A3F`, `FEAT-20260424-002`

## Resolving Entries

When an issue is fixed or a learning is integrated:

1. Change `**Status**: pending` to one of `resolved`, `promoted`, `promoted_to_skill`, `in_progress`, or `wont_fix`.
2. Add a resolution block after `Metadata`:

```markdown
### Resolution
- **Resolved**: 2026-04-24T09:00:00Z
- **Commit/PR**: abc123 or #42
- **Notes**: Brief description of what was done
```

## Promotion Targets

Promote a learning when it should change future behavior across sessions.

| Target | Use For |
|--------|---------|
| `AGENTS.md` | Repo-wide agent workflow rules and execution order |
| `.github/copilot-instructions.md` | Project context and coding conventions for Copilot |
| `/memories/repo` | Short repository facts that should persist across conversations |

Promotion heuristics:

- The learning applies across multiple files or tasks.
- The same mistake is likely to recur.
- The rule is concise enough to encode as durable guidance.
- Future agents should know it before touching the area again.

Write promoted rules as short prevention rules, not long incident reports.

## Recurring Pattern Detection

If a new issue resembles an existing learning:

1. Search `.chrono/learnings/` first.
2. Reuse `Pattern-Key` when the issue is the same class of failure.
3. Add `See Also` links between related entries.
4. Increase `Recurrence-Count` when the same pattern repeats.
5. Escalate repeated issues into `AGENTS.md`, `.github/copilot-instructions.md`, or `/memories/repo`.

Example search:

```bash
grep -R "Pattern-Key:\|timeout\|pnpm" .chrono/learnings/
```

## Review Workflow

Review `.chrono/learnings/` at natural breakpoints:

- Before a major implementation task
- After resolving a non-obvious bug
- When returning to an area with prior failures
- When a recurring workflow keeps needing manual recovery

Useful checks:

```bash
grep -h "Status\*\*: pending" .chrono/learnings/*.md | wc -l
grep -B5 "Priority\*\*: high" .chrono/learnings/*.md | grep "^## \["
grep -l "Area\*\*: backend" .chrono/learnings/*.md
```

## Best Practices

1. Log immediately while the context is still specific.
2. Prefer concrete fixes over vague observations.
3. Link related files so later sessions can route quickly.
4. Promote durable rules once they are stable.
5. Extract skills only after the solution is verified.
6. Keep entries short enough to scan quickly.

## Copilot Workflow Integration

GitHub Copilot supports configurable hooks for Copilot CLI and the Copilot cloud agent, including
session lifecycle hooks, prompt submission hooks, tool-use hooks, and error hooks. This skill does
not require those hooks to be present, but it should fit cleanly into workflows that use them.

Recommended pattern:

1. Review `.chrono/learnings/` before major work in a familiar problem area.
2. After a meaningful fix or correction, append or update an entry.
3. Promote durable rules into `AGENTS.md`, `.github/copilot-instructions.md`, or `/memories/repo`.
4. When a resolved learning is broadly reusable, extract it into a skill scaffold.

If a team configures Copilot hooks, use them as optional automation around this workflow, for
example to log session events, inspect tool failures, or feed tool output into the helper scripts.
Keep the core learning flow explicit so it still works without hook setup.

Optional helper scripts:

| Script | Purpose |
|--------|---------|
| `scripts/activator.js` | Emits a compact reminder for manual use or editor tasks |
| `scripts/error-detector.js` | Detects likely errors from piped text, CLI input, or env vars |
| `scripts/extract-skill.js` | Scaffolds a new skill from a resolved learning |

## Script Usage

### Reminder Helper

```bash
node skills/chrono-self-improvement/scripts/activator.js
```

### Error Detection Helper

Pipe output into the detector:

```bash
pnpm test 2>&1 | node skills/chrono-self-improvement/scripts/error-detector.js
```

Or pass explicit text:

```bash
node skills/chrono-self-improvement/scripts/error-detector.js --text "npm ERR! missing script: build"
```

### Skill Extraction Helper

```bash
node skills/chrono-self-improvement/scripts/extract-skill.js docker-fixes --dry-run
node skills/chrono-self-improvement/scripts/extract-skill.js docker-fixes
```

## Skill Extraction Criteria

Extract a learning into a skill when at least one of these is true:

| Criterion | Description |
|-----------|-------------|
| Recurring | The learning links to multiple related issues |
| Verified | The solution is resolved and works |
| Non-obvious | Discovering the fix required real investigation |
| Broadly applicable | The pattern is useful beyond one file or task |
| User-flagged | The user explicitly wants the pattern saved as a skill |

## Extraction Workflow

1. Identify a resolved, reusable learning.
2. Run the extraction helper in dry-run mode.
3. Generate the scaffold.
4. Fill the template with the distilled solution.
5. Update the original learning with `promoted_to_skill` and `Skill-Path`.

## Related Files

- `assets/LEARNINGS.md`
- `assets/SKILL-TEMPLATE.md`
- `references/examples.md`
- `references/hooks-setup.md`

## Source

This skill captures operational learnings discovered during real implementation work and adapts them for GitHub Copilot-first workflows.