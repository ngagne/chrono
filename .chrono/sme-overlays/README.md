# Chrono SME Overlays

Chrono's built-in skills are intentionally generic. Put project-specific subject matter expertise in this directory so you can update Chrono itself without overwriting your team's rules.

## Structure

```text
.chrono/
└── sme-overlays/
	├── general/
	├── plan/
	└── execute/
```

## How Chrono uses these files

- `chrono-plan` reads every Markdown file in `.chrono/sme-overlays/general/` and
	`.chrono/sme-overlays/plan/` before discovery and planning.
- `chrono-plan` ignores scaffold `README.md` files when deciding whether real SME overlays exist.
- `chrono-execute` reads every Markdown file in `.chrono/sme-overlays/general/` and
	`.chrono/sme-overlays/execute/` on each loop iteration.
- In `.chrono/sme-overlays/general/`, every Markdown file applies to both `chrono-plan` and
	`chrono-execute`.
- In `.chrono/sme-overlays/execute/`, files named `shared-*.md` or files with no prefix apply to
	all execution subagents.
- Files named `coder-*.md` apply only to the Coder subagent.
- Files named `inspector-*.md` apply only to the Task Inspector and Phase Inspector.

## What to put here

- Architecture constraints that are easy to miss in a generic workflow
- Domain-specific compliance or safety rules
- Test and verification expectations beyond standard preflight checks
- Review heuristics or rollout requirements specific to this repository

Keep each file short, explicit, and scoped to one topic when possible.

## When to use overlays vs other mechanisms

- Use repo instructions such as `AGENTS.md` when a rule should apply to most work in the repository, even when Chrono is not involved.
- Use SME overlays when the rule should shape Chrono's planning artifacts, task generation, coding loop, or inspector behavior for this specific project.
- Use a skill when you need a reusable workflow or capability that should be triggered or invoked independently, not always loaded as Chrono context.
- Avoid duplicating generic coding standards in overlays; they are best used for Chrono-specific domain and workflow constraints.
