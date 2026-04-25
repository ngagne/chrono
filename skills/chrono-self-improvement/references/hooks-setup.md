# GitHub Copilot Setup Guide

This skill is intended for GitHub Copilot in VS Code. GitHub Copilot supports hooks for both the
Copilot CLI and the Copilot cloud agent through `.github/hooks/*.json` configuration files. Use
hooks when you want lightweight automation around this skill, but keep the skill usable even when
no hooks are configured.

## Hook Capabilities

GitHub Copilot currently documents these hook types:

- `sessionStart`
- `sessionEnd`
- `userPromptSubmitted`
- `preToolUse`
- `postToolUse`
- `errorOccurred`

Important behavior notes:

- `preToolUse` is the main enforcement hook. It can deny a tool execution by returning JSON with
	`permissionDecision: "deny"` and a `permissionDecisionReason`.
- For the other documented hook types, output is ignored by Copilot.
- Multiple hooks of the same type can be configured and they run in order.
- Command hooks support `bash`, `powershell`, optional `cwd`, optional `env`, and optional
	`timeoutSec` with a default timeout of 30 seconds.

Minimal example:

```json
{
	"version": 1,
	"hooks": {
		"postToolUse": [
			{
				"type": "command",
				"bash": "cat >> logs/tool-results.jsonl",
				"powershell": "$input | Add-Content -Path logs/tool-results.jsonl"
			}
		]
	}
}
```

## Recommended Setup

1. Keep the skill in your workspace under `skills/chrono-self-improvement/`.
2. Create `.chrono/learnings/` in the project root when the first reusable issue appears.
3. Optionally add `.github/hooks/*.json` if you want Copilot to automate logging, failure capture,
	or policy checks around the skill.
4. Add concise promotion targets to `AGENTS.md` or `.github/copilot-instructions.md` once a
	learning becomes durable.
5. Run the helper scripts with `node` so the same commands work on macOS and Windows.

## Suggested Hook Uses For This Skill

Use hooks as small automation layers around the core workflow:

- `sessionStart`: initialize logs or session metadata.
- `userPromptSubmitted`: capture prompts that may warrant later learning review.
- `postToolUse`: log failures or pipe tool output into review scripts.
- `errorOccurred`: capture agent-level errors for later triage.
- `sessionEnd`: summarize or archive session artifacts.

Prefer `postToolUse` for logging and analysis. Use `preToolUse` only when you intentionally want
to enforce a policy before a tool runs.

## Example: Email The User When `sessionEnd` Fires

For long-running workflows such as `chrono-execute` over many phases or tasks, a `sessionEnd`
hook can notify the user that the run finished while they were AFK.

Example hook configuration:

```json
{
	"version": 1,
	"hooks": {
		"sessionEnd": [
			{
				"type": "command",
				"bash": "./scripts/email-session-end.sh",
				"powershell": "./scripts/email-session-end.ps1",
				"cwd": ".github/hooks",
				"env": {
					"NOTIFY_EMAIL": "you@example.com"
				},
				"timeoutSec": 30
			}
		]
	}
}
```

Example Bash script:

```bash
#!/bin/bash
set -euo pipefail

INPUT=$(cat)
REASON=$(echo "$INPUT" | jq -r '.reason')
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
CWD=$(echo "$INPUT" | jq -r '.cwd')
EMAIL_TO="${NOTIFY_EMAIL:-}"

if [[ -z "$EMAIL_TO" ]]; then
	exit 0
fi

SUBJECT="Chrono run finished: ${REASON}"
BODY=$(cat <<EOF
Your Copilot session has ended.

Reason: ${REASON}
Timestamp: ${TIMESTAMP}
Workspace: ${CWD}

This is useful for long chrono-execute runs when you are away from keyboard.
EOF
)

printf '%s\n' "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO"
```

Example PowerShell script:

```powershell
$ErrorActionPreference = "Stop"

$inputObject = [Console]::In.ReadToEnd() | ConvertFrom-Json
$emailTo = $env:NOTIFY_EMAIL

if ([string]::IsNullOrWhiteSpace($emailTo)) {
	exit 0
}

$reason = $inputObject.reason
$timestamp = $inputObject.timestamp
$cwd = $inputObject.cwd

$subject = "Chrono run finished: $reason"
$body = @"
Your Copilot session has ended.

Reason: $reason
Timestamp: $timestamp
Workspace: $cwd

This is useful for long chrono-execute runs when you are away from keyboard.
"@

Send-MailMessage -To $emailTo -Subject $subject -Body $body -SmtpServer "smtp.example.com"
```

Notes:

- The `sessionEnd` payload includes a `reason` field such as `complete`, `error`, `abort`,
	`timeout`, or `user_exit`, which makes it useful for concise completion notifications.
- The Bash example assumes a working `mail` command is installed and configured.
- The PowerShell example assumes access to an SMTP server. Replace `smtp.example.com` with your
	actual mail relay or use your organization's preferred mail-sending script.

## Manual Reminder Flow

Use the reminder helper when you want a quick prompt to decide whether the current task produced a reusable learning:

```bash
node skills/chrono-self-improvement/scripts/activator.js
```

This prints a short checklist you can paste into notes, a task description, or an editor task.

## Error Detection Flow

The error detector is a small CLI utility. You can run it manually or call it from a Copilot hook,
such as `postToolUse` or `errorOccurred`, when you want a quick recommendation on whether a failure
should be logged.

### Pipe command output

```bash
pnpm lint 2>&1 | node skills/chrono-self-improvement/scripts/error-detector.js
```

### Pass explicit text

```bash
node skills/chrono-self-improvement/scripts/error-detector.js --text "TypeError: Cannot read properties of undefined"
```

### Use environment variables

The detector will also read `COPILOT_TOOL_OUTPUT` if it is present:

```bash
COPILOT_TOOL_OUTPUT="npm ERR! missing script: test" node skills/chrono-self-improvement/scripts/error-detector.js
```

## Skill Extraction Flow

Generate a new skill scaffold from a resolved learning:

```bash
node skills/chrono-self-improvement/scripts/extract-skill.js test-fixture-pattern --dry-run
node skills/chrono-self-improvement/scripts/extract-skill.js test-fixture-pattern
```

Optional flags:

```bash
node skills/chrono-self-improvement/scripts/extract-skill.js test-fixture-pattern --output-dir ./skills
node skills/chrono-self-improvement/scripts/extract-skill.js --help
```

## Suggested Copilot Conventions

Use these conventions when promoting learnings for future sessions:

- `AGENTS.md`: execution order, validation rules, repo-specific workflow constraints
- `.github/copilot-instructions.md`: coding conventions, generated-file rules, domain constraints
- `/memories/repo`: short project facts or patterns worth persisting across conversations

## Verification

Check the helper scripts directly:

```bash
node skills/chrono-self-improvement/scripts/activator.js
node skills/chrono-self-improvement/scripts/error-detector.js --text "command not found"
node skills/chrono-self-improvement/scripts/extract-skill.js sample-skill --dry-run
```

Expected behavior:

- `activator.js` prints a short reminder block
- `error-detector.js` prints an error reminder only when the text looks like a real failure
- `extract-skill.js --dry-run` prints the scaffold it would create without touching files

If you configure hooks, also validate the hook JSON shape and script behavior against Copilot's
documented event payloads and output rules. In particular, only rely on `preToolUse` output for
permission enforcement.

## Troubleshooting

### `node: command not found`

Install Node.js and verify `node --version` works in your terminal.

### No output from `error-detector.js`

The detector is intentionally quiet unless it finds a likely error marker. Pass `--text` with a known failing message to confirm behavior.

### Skill already exists

Choose a different skill name or remove the existing target directory before re-running the extractor.

### Windows path issues

Prefer `node skills/chrono-self-improvement/scripts/<script>.js` over relying on executable bits or shell-specific path behavior.