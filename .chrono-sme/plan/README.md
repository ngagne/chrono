# Planning Overlay Files

Put planning-stage SME notes here as Markdown files.

The planning skill ignores this scaffold `README.md` when checking whether you have added any real
SME overlays yet.

Examples:

- `architecture.md` for required service boundaries or layering rules
- `compliance.md` for privacy, audit, or regulatory constraints
- `api-standards.md` for contract conventions that must appear in specs and plans

These files are read by `chrono-plan` from `.chrono-sme/plan/` before it asks clarifying questions
or writes planning artifacts.

Suggested style:

- State the rule or expectation directly
- Explain why it matters when the reason is not obvious
- Prefer repository-specific guidance over general software advice
