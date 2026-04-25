# Execution Overlay Files

Put execution and verification SME notes here as Markdown files.

The planning skill ignores this scaffold `README.md` when checking whether you have added any real
SME overlays yet.

## File naming

- `shared-*.md`: applies to the Coder, Task Inspector, and Phase Inspector
- `coder-*.md`: applies only during implementation
- `inspector-*.md`: applies only during task and phase review
- Files without a prefix are treated as shared

Examples:

- `shared-release.md` for deployment evidence or rollback notes
- `coder-testing.md` for required smoke tests or fixture conventions
- `inspector-accessibility.md` for review gates that inspectors must enforce

These files are read by `chrono-execute` from `.chrono/sme-overlays/execute/` on each loop
iteration so updates can take effect without modifying the installed skill. Chrono also loads any
cross-cutting guidance from `.chrono/sme-overlays/general/` before these execution-specific
overlays.
