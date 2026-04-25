#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const skillsSourceDir = path.join(repoRoot, 'skills');
const originalCwd = process.cwd();
const homeDir = os.homedir();
const installTargetDir = path.join(homeDir, '.agents', 'skills');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

function printUsage() {
  console.log('Usage: chrono-cli init [--dry-run]');
}

function logStep(message) {
  console.log(`\n> ${message}`);
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyChronoSkills(dryRun) {
  if (!dryRun) {
    ensureDirectory(installTargetDir);
  }

  const entries = fs.readdirSync(skillsSourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const sourcePath = path.join(skillsSourceDir, entry.name);
    const destinationPath = path.join(installTargetDir, entry.name);
    if (dryRun) {
      console.log(`[dry-run] Copy ${entry.name} to ${destinationPath}`);
      continue;
    }

    fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });
    console.log(`Copied ${entry.name} to ${destinationPath}`);
  }
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: options.cwd || originalCwd,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function runInstallCommands(dryRun) {
  const commands = [
    {
      description: 'Install Playwright CLI globally',
      command: npmCommand,
      args: ['install', '-g', '@playwright/cli@latest'],
      cwd: originalCwd,
    },
    {
      description: 'Install Playwright CLI skills',
      command: npxCommand,
      args: ['-y', '@playwright/cli@latest', 'install', '--skills'],
      cwd: homeDir,
    },
    {
      description: 'Install UI-UX-Pro-Max',
      command: npxCommand,
      args: ['-y', 'uipro-cli@latest', 'init', '--ai', 'cursor'],
      cwd: homeDir,
    },
    {
      description: 'Install Context7 CLI integration',
      command: npxCommand,
      args: ['-y', 'ctx7@latest', 'setup', '--cli', '--claude', '-y'],
      cwd: originalCwd,
    },
  ];

  for (const step of commands) {
    logStep(step.description);
    if (dryRun) {
      console.log(`[dry-run] cwd=${step.cwd} ${step.command} ${step.args.join(' ')}`);
      continue;
    }

    runCommand(step.command, step.args, { cwd: step.cwd });
  }
}

function init() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const helpRequested = args.includes('--help') || args.includes('-h');
  const command = args.find((arg) => !arg.startsWith('-'));

  if (helpRequested) {
    printUsage();
    process.exit(0);
  }

  if (!command) {
    printUsage();
    process.exit(1);
  }

  if (command !== 'init') {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  try {
    logStep('Copy Chrono skills');
    copyChronoSkills(dryRun);

    process.chdir(homeDir);
    runInstallCommands(dryRun);
  } catch (error) {
    console.error(`\nChrono installation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    process.chdir(originalCwd);
  }

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  console.log('\nChrono installation completed successfully.');
}

init();