#!/usr/bin/env node

const banner = `
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ 
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗
██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝`;

// output banner in a horizontal gradient of cyan -> blue -> magenta
function printBanner() {
  const colors = ['\x1b[36m', '\x1b[34m', '\x1b[35m'];
  const reset = '\x1b[0m';
  const bannerLines = banner.split('\n');
  for (let i = 0; i < bannerLines.length; i++) {
    const color = colors[Math.floor((i / bannerLines.length) * colors.length)];
    console.log(color + bannerLines[i] + reset);
  }
}

printBanner();

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const skillsSourceDir = path.join(repoRoot, 'skills');
const chronoSourceDir = path.join(repoRoot, '.chrono');
const originalCwd = process.cwd();
const homeDir = os.homedir();
const installTargetDir = path.join(homeDir, '.agents', 'skills');
const localChronoTargetDir = path.join(originalCwd, '.chrono');
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

function copyProjectSmeScaffold(dryRun) {
  if (!fs.existsSync(chronoSourceDir)) {
    throw new Error(`Missing Chrono scaffold directory: ${chronoSourceDir}`);
  }

  if (fs.existsSync(localChronoTargetDir)) {
    console.log(`Skipping .chrono scaffold; destination already exists at ${localChronoTargetDir}`);
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] Copy .chrono scaffold to ${localChronoTargetDir}`);
    return;
  }

  fs.cpSync(chronoSourceDir, localChronoTargetDir, { recursive: true, force: false });
  console.log(`Copied .chrono scaffold to ${localChronoTargetDir}`);
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

function printNextSteps() {
  console.log('\nNext steps:');
  console.log('1. Put cross-cutting SME guidance in .chrono/sme-overlays/general/*.md.');
  console.log('2. Put planning and architecture expertise in .chrono/sme-overlays/plan/*.md.');
  console.log('3. Put implementation, testing, and verification expertise in .chrono/sme-overlays/execute/*.md.');
  console.log('4. Review and keep learnings under .chrono/learnings/.');
  console.log('5. Keep those folders outside the installed skills directory so they survive Chrono upgrades.');
  console.log('6. See README.md for the overlay file conventions and examples.');
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

    logStep('Seed project-local Chrono scaffold');
    copyProjectSmeScaffold(dryRun);

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
  printNextSteps();
}

init();