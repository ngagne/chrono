#!/usr/bin/env node

const reminder = `<self-improvement-reminder>
After completing this task, evaluate whether reusable knowledge emerged:
- Non-obvious fix discovered through investigation?
- Project-specific convention confirmed?
- Error required debugging to resolve?
- Recurring pattern worth promoting or extracting?

If yes: log it in .learnings/ and promote durable rules into AGENTS.md, .github/copilot-instructions.md, or /memories/repo.
</self-improvement-reminder>`;

process.stdout.write(`${reminder}\n`);