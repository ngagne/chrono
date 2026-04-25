#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const colors = {
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  reset: "\u001b[0m"
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logInfo(message) {
  process.stdout.write(`${colorize("green", "[INFO]")} ${message}\n`);
}

function logWarn(message) {
  process.stdout.write(`${colorize("yellow", "[WARN]")} ${message}\n`);
}

function logError(message) {
  process.stderr.write(`${colorize("red", "[ERROR]")} ${message}\n`);
}

function usage() {
  process.stdout.write("Usage: node extract-skill.js <skill-name> [options]\n\n");
  process.stdout.write("Create a new skill scaffold from a resolved learning entry.\n\n");
  process.stdout.write("Arguments:\n");
  process.stdout.write("  skill-name       Lowercase skill name using hyphens\n\n");
  process.stdout.write("Options:\n");
  process.stdout.write("  --dry-run        Show what would be created without creating files\n");
  process.stdout.write("  --output-dir     Override the skills directory (default: ./skills)\n");
  process.stdout.write("  -h, --help       Show this help message\n");
}

function titleize(skillName) {
  return skillName
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function buildTemplate(skillName) {
  return `---
name: ${skillName}
description: "[TODO: Add a concise description of what this skill does and when to use it]"
---

# ${titleize(skillName)}

[TODO: Brief introduction explaining the skill's purpose]

## Quick Reference

| Situation | Action |
|-----------|--------|
| [Trigger condition] | [What to do] |

## Usage

[TODO: Detailed usage instructions]

## Examples

[TODO: Add concrete examples]

## Source Learning

This skill was extracted from a learning entry.
- Learning ID: [TODO: Add original learning ID]
- Original File: .chrono/learnings/LEARNINGS.md
`;
}

function parseArgs(argv) {
  const args = {
    skillName: "",
    dryRun: false,
    outputDir: "./skills",
    help: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (current === "--output-dir") {
      args.outputDir = argv[index + 1] ?? args.outputDir;
      index += 1;
      continue;
    }
    if (current === "--help" || current === "-h") {
      args.help = true;
      continue;
    }
    if (current.startsWith("-")) {
      throw new Error(`Unknown option: ${current}`);
    }
    if (!args.skillName) {
      args.skillName = current;
      continue;
    }
    throw new Error(`Unexpected argument: ${current}`);
  }

  return args;
}

function validateSkillName(skillName) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    return;
  }

  if (!args.skillName) {
    usage();
    throw new Error("Skill name is required");
  }

  if (!validateSkillName(args.skillName)) {
    throw new Error("Invalid skill name format. Use lowercase letters, numbers, and hyphens only.");
  }

  const skillsDir = path.resolve(process.cwd(), args.outputDir);
  const skillPath = path.join(skillsDir, args.skillName);
  const skillFilePath = path.join(skillPath, "SKILL.md");
  const template = buildTemplate(args.skillName);

  if (args.dryRun) {
    logInfo("Dry run - would create:");
    process.stdout.write(`  ${skillPath}${path.sep}\n`);
    process.stdout.write(`  ${skillFilePath}\n\n`);
    process.stdout.write("Template content would be:\n");
    process.stdout.write(template);
    return;
  }

  if (fs.existsSync(skillPath)) {
    throw new Error(`Skill already exists: ${skillPath}`);
  }

  fs.mkdirSync(skillPath, { recursive: true });
  fs.writeFileSync(skillFilePath, template, "utf8");

  logInfo(`Created: ${skillFilePath}`);
  process.stdout.write("\nNext steps:\n");
  process.stdout.write(`  1. Edit ${skillFilePath}\n`);
  process.stdout.write("  2. Fill in the TODO sections with content from your learning\n");
  process.stdout.write("  3. Add references/ if the skill needs detailed docs\n");
  process.stdout.write("  4. Add scripts/ if the skill needs executable helpers\n");
  process.stdout.write("  5. Update the original learning entry with promoted_to_skill and Skill-Path\n");

  if (!fs.existsSync(path.join(process.cwd(), ".chrono", "learnings"))) {
    logWarn("No .chrono/learnings directory found in the current working directory.");
  }
}

try {
  main();
} catch (error) {
  logError(error.message);
  process.exitCode = 1;
}