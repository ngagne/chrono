# General Overlay Files

Put cross-cutting SME notes here as Markdown files.

These files are loaded whenever `chrono-plan` or `chrono-execute` runs, before any skill-specific
overlay files.

Examples:

- `terminology.md` for required domain language or naming
- `security-baseline.md` for rules that apply during planning and implementation
- `release-governance.md` for rollout or audit constraints that must shape both plans and reviews

Suggested style:

- State the rule or expectation directly
- Explain why it matters when the reason is not obvious
- Keep guidance broadly applicable across planning and execution