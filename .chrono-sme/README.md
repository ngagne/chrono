# Chrono SME Overlays

Chrono's built-in skills are intentionally generic. Put project-specific subject matter expertise in this directory so you can update Chrono itself without overwriting your team's rules.

## Structure

```text
.chrono-sme/
├── plan/
└── execute/
```

## How Chrono uses these files

- `chrono-plan` reads every Markdown file in `.chrono-sme/plan/` before discovery and planning.
- `chrono-plan` ignores scaffold `README.md` files when deciding whether real SME overlays exist.
- `chrono-execute` reads every Markdown file in `.chrono-sme/execute/` on each loop iteration.
- In `.chrono-sme/execute/`, files named `shared-*.md` or files with no prefix apply to all execution subagents.
- Files named `coder-*.md` apply only to the Coder subagent.
- Files named `inspector-*.md` apply only to the Task Inspector and Phase Inspector.

## What to put here

- Architecture constraints that are easy to miss in a generic workflow
- Domain-specific compliance or safety rules
- Test and verification expectations beyond standard preflight checks
- Review heuristics or rollout requirements specific to this repository

Keep each file short, explicit, and scoped to one topic when possible.
