#!/usr/bin/env node

const ERROR_PATTERNS = [
  "error:",
  "failed",
  "command not found",
  "no such file",
  "permission denied",
  "fatal:",
  "exception",
  "traceback",
  "npm err!",
  "modulenotfounderror",
  "syntaxerror",
  "typeerror",
  "exit code",
  "non-zero",
  "enoent",
  "eacces"
];

function parseArgs(argv) {
  const args = { text: "", help: false };

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === "--help" || current === "-h") {
      args.help = true;
      continue;
    }
    if (current === "--text") {
      args.text = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return args;
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
  });
}

function printHelp() {
  process.stdout.write("Usage: node error-detector.js [--text <message>]\n\n");
  process.stdout.write("Detect likely command or tool failures and emit a Chrono self-improvement reminder.\n");
}

function containsError(text) {
  const normalized = text.toLowerCase();
  return ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const stdinText = await readStdin();
  const output = args.text || stdinText || process.env.COPILOT_TOOL_OUTPUT || "";

  if (!containsError(output)) {
    return;
  }

  process.stdout.write("<error-detected>\n");
  process.stdout.write("A likely command or tool failure was detected. Consider logging it to .chrono/learnings/ERRORS.md if it was non-obvious, reusable, or likely to recur.\n");
  process.stdout.write("Use the chrono-self-improvement format: [ERR-YYYYMMDD-XXX]\n");
  process.stdout.write("</error-detected>\n");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});