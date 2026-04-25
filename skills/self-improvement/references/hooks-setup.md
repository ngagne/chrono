# GitHub Copilot Setup Guide

This skill is intended for GitHub Copilot in VS Code. Copilot does not currently expose prompt or tool hooks in the same way some other coding agents do, so setup is based on explicit workflow usage and portable Node helpers.

## Recommended Setup

1. Keep the skill in your workspace under `skills/self-improvement/`.
2. Create `.learnings/` in the project root when the first reusable issue appears.
3. Add concise promotion targets to `AGENTS.md` or `.github/copilot-instructions.md` once a learning becomes durable.
4. Run the helper scripts with `node` so the same commands work on macOS and Windows.

## Manual Reminder Flow

Use the reminder helper when you want a quick prompt to decide whether the current task produced a reusable learning:

```bash
node skills/self-improvement/scripts/activator.js
```

This prints a short checklist you can paste into notes, a task description, or an editor task.

## Error Detection Flow

The error detector is a small CLI utility, not a background hook. Feed it command output when you want a quick recommendation on whether a failure should be logged.

### Pipe command output

```bash
pnpm lint 2>&1 | node skills/self-improvement/scripts/error-detector.js
```

### Pass explicit text

```bash
node skills/self-improvement/scripts/error-detector.js --text "TypeError: Cannot read properties of undefined"
```

### Use environment variables

The detector will also read `COPILOT_TOOL_OUTPUT` if it is present:

```bash
COPILOT_TOOL_OUTPUT="npm ERR! missing script: test" node skills/self-improvement/scripts/error-detector.js
```

## Skill Extraction Flow

Generate a new skill scaffold from a resolved learning:

```bash
node skills/self-improvement/scripts/extract-skill.js test-fixture-pattern --dry-run
node skills/self-improvement/scripts/extract-skill.js test-fixture-pattern
```

Optional flags:

```bash
node skills/self-improvement/scripts/extract-skill.js test-fixture-pattern --output-dir ./skills
node skills/self-improvement/scripts/extract-skill.js --help
```

## Suggested Copilot Conventions

Use these conventions when promoting learnings for future sessions:

- `AGENTS.md`: execution order, validation rules, repo-specific workflow constraints
- `.github/copilot-instructions.md`: coding conventions, generated-file rules, domain constraints
- `/memories/repo`: short project facts or patterns worth persisting across conversations

## Verification

Check the helper scripts directly:

```bash
node skills/self-improvement/scripts/activator.js
node skills/self-improvement/scripts/error-detector.js --text "command not found"
node skills/self-improvement/scripts/extract-skill.js sample-skill --dry-run
```

Expected behavior:

- `activator.js` prints a short reminder block
- `error-detector.js` prints an error reminder only when the text looks like a real failure
- `extract-skill.js --dry-run` prints the scaffold it would create without touching files

## Troubleshooting

### `node: command not found`

Install Node.js and verify `node --version` works in your terminal.

### No output from `error-detector.js`

The detector is intentionally quiet unless it finds a likely error marker. Pass `--text` with a known failing message to confirm behavior.

### Skill already exists

Choose a different skill name or remove the existing target directory before re-running the extractor.

### Windows path issues

Prefer `node skills/self-improvement/scripts/<script>.js` over relying on executable bits or shell-specific path behavior.