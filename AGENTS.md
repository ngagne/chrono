# AGENTS.md

Instructions for agents working in this repository. Optimize for GitHub Copilot CLI first.

## Purpose

This repository defines and documents the Chrono workflow:
- core skill files in `.github/skills/chrono-plan/` and `.github/skills/chrono-execute/`
- supporting community skill files in `.github/skills/find-docs/`, `.github/skills/playwright-cli/`
- UI design prompt in `.github/prompts/ui-ux-pro-max/`
- top-level documentation in `README.md`
- screenshots and diagrams in `images/`

The two core skills — `chrono-plan` and `chrono-execute` — are the primary artifacts of this project.
The supporting skills and prompts are open-source community tools that Chrono leverages but does not own.

Most changes in this repo are prompt engineering and documentation work, not application code.

## Primary Goal

Balance three things deliberately:
- time to useful result
- token cost
- output quality

Default bias:
- prefer small, targeted reads before broad exploration
- prefer single-file or tightly scoped edits over repo-wide rewrites
- prefer clear operational instructions over long explanatory prose
- prefer preserving working prompt structure over stylistic cleanup

## Working Style

When handling a task in this repo:
1. Read only the files directly related to the request first.
2. Infer the minimum necessary change.
3. Edit the smallest set of files that fully solves the request.
4. Validate consistency with adjacent docs or agent files.
5. Stop when the requested outcome is complete.

Do not perform broad repo audits unless the user asks for one.

## Repo-Specific Priorities

### Core Skill Files

`SKILL.md` files in `.github/skills/chrono-plan/` and `.github/skills/chrono-execute/` are the highest-sensitivity artifacts in this repo.

When editing them:
- preserve YAML front matter keys and overall structure
- preserve subagent instruction blocks (`<CODER_SUBAGENT_INSTRUCTIONS>`, `<TASK_INSPECTOR_SUBAGENT_INSTRUCTIONS>`, etc.) and phase boundaries
- keep instruction hierarchies explicit and easy to scan
- prefer deterministic language such as "must", "must not", and clear phase boundaries
- avoid adding redundant prose that increases token cost without improving behavior
- keep subagent contracts concrete: inputs, outputs, stopping rules, validation rules

### Supporting Community Skills and Prompts

Files in `.github/skills/find-docs/`, `.github/skills/playwright-cli/`, and `.github/prompts/ui-ux-pro-max/` are community/open-source tools that Chrono leverages. Do not edit these unless the user explicitly requests it and understands they are not part of this project.

### README

When editing `README.md`:
- keep it aligned with the current skill behavior
- update examples only when behavior or file names actually changed
- prefer concise, operational documentation over marketing language
- do not claim capabilities that are not encoded in the skill prompts

### Images

Do not modify files in `images/` unless the user explicitly asks.

## Copilot CLI Optimization

Assume the executing agent may have limited context windows and should avoid unnecessary work.

Prefer:
- root `AGENTS.md` guidance over duplicating instructions across many files
- short plans with clear checkpoints
- focused searches using exact file paths or precise keywords
- incremental edits that can be verified quickly

Avoid:
- reading large files end-to-end when only one section is relevant
- rewriting prompt files for tone alone
- adding process that requires many extra turns unless quality clearly benefits
- speculative refactors across multiple prompt files without a concrete request

## Quality Bar

Aim for instructions that are:
- explicit enough for consistent agent execution
- short enough to avoid wasting tokens
- structured enough to support fast parsing by both humans and agents

Good prompt changes usually improve at least one of these:
- clearer role definition
- better stopping conditions
- better delegation boundaries
- better validation criteria
- lower ambiguity in task selection or completion rules

## Validation

This repo does not currently expose a formal build or test pipeline at the root.

For most changes, validate by:
- checking Markdown structure and readability
- ensuring file names and paths referenced in docs actually exist
- ensuring instructions do not contradict existing skill contracts
- keeping terminology consistent across `README.md` and `.github/skills/`

Do not invent commands such as `npm test`, `make`, or `just` unless the repo adds them.

## Change Heuristics

Use these heuristics to control time and token cost:
- If the request is narrow, inspect 1 to 3 files before editing.
- If the request touches one skill, avoid reading every skill file unless needed for consistency.
- If README wording and skill wording disagree, fix the source-of-truth artifact first, then adjust the other file only if necessary.
- Prefer one well-formed patch over many small cosmetic patches.

## When To Ask The User

Ask only when a decision materially changes behavior and cannot be inferred from the repo, for example:
- whether a new convention should apply to all agents or only one
- whether a docs change is meant to describe current behavior or propose new behavior
- whether compatibility with a specific Copilot surface other than CLI is required

If the likely intent is clear, proceed.

## Non-Goals

Unless explicitly requested, do not:
- redesign the Chrono workflow
- rename agents or move files
- add new operational phases to agent prompts
- add large theory sections to documentation
- optimize for another tool at the expense of Copilot CLI clarity

## Preferred Output Shape

For new or revised instructions in this repo, favor this order:
1. role and scope
2. inputs and artifacts
3. required workflow or decision order
4. validation and stopping rules
5. exceptions or escalation paths

Keep instructions concrete. If a sentence does not change agent behavior, cut it.