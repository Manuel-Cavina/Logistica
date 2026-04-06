const [, , command, ...rawArgs] = process.argv;

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = args[index + 1];
    const value = next && !next.startsWith("--") ? next : "true";

    if (value !== "true") {
      index += 1;
    }

    if (parsed[key] === undefined) {
      parsed[key] = value;
      continue;
    }

    if (Array.isArray(parsed[key])) {
      parsed[key].push(value);
      continue;
    }

    parsed[key] = [parsed[key], value];
  }

  return parsed;
}

function asArray(value) {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function printUsage() {
  console.log(`Usage:
  pnpm agent:branch --issue-number 123 --issue-title "Implementar alta de vehicle" [--slug e3-schema] [--type feature]
  pnpm agent:pr --lane frontend-e2-redesign --issue-number 456 --issue-title "Redisenar onboarding" [--acceptance "..."] [--test "..."] [--risk "..."] [--notes "..."]`);
}

function requireArg(args, key) {
  const value = args[key];

  if (!value) {
    throw new Error(`Missing required argument --${key}`);
  }

  return value;
}

function getLaneLabel(lane) {
  const laneMap = {
    "backend-e3": "Backend E3",
    "frontend-e2-redesign": "Frontend E2 Redesign",
    "shared-support": "Shared Support",
  };

  return laneMap[lane] ?? lane;
}

function buildBranchName(args) {
  const issueNumber = requireArg(args, "issue-number");
  const branchSlug = args.slug
    ? slugify(args.slug)
    : slugify(requireArg(args, "issue-title"));
  const branchType = args.type ?? "feature";

  return `${branchType}/${issueNumber}-${branchSlug}`;
}

function buildChecklist(items, fallback) {
  const entries = items.length > 0 ? items : [fallback];
  return entries.map((item) => `- [ ] ${item}`).join("\n");
}

function buildBullets(items, fallback) {
  const entries = items.length > 0 ? items : [fallback];
  return entries.map((item) => `- ${item}`).join("\n");
}

function buildPrBody(args) {
  const lane = requireArg(args, "lane");
  const issueNumber = requireArg(args, "issue-number");
  const issueTitle = requireArg(args, "issue-title");
  const acceptance = asArray(args.acceptance);
  const tests = asArray(args.test);
  const risks = asArray(args.risk);
  const notes = asArray(args.notes);

  const branchName = buildBranchName(args);
  const laneLabel = getLaneLabel(lane);

  return `## Summary

Closes #${issueNumber}
Lane: ${laneLabel}
Branch: \`${branchName}\`
Issue: ${issueTitle}

## What Changed

- Describe the core implementation.
- Call out the user-visible outcome.
- Mention follow-up work only if it is truly required.

## Acceptance Criteria

${buildChecklist(acceptance, "Copy the acceptance criteria from the issue before opening the PR.")}

## Validation

${buildBullets(tests, "List the commands or manual checks you ran.")}

## Risks

${buildBullets(risks, "Describe any remaining risk or write None if there is no known risk.")}

## UI Evidence

- Add screenshots here if the change affects UI.

## Notes For Review

${buildBullets(notes, "Document assumptions, edge cases, or handoff notes for the merge review.")}`;
}

try {
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  const args = parseArgs(rawArgs);

  if (command === "branch") {
    console.log(buildBranchName(args));
    process.exit(0);
  }

  if (command === "pr") {
    console.log(buildPrBody(args));
    process.exit(0);
  }

  throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(error.message);
  printUsage();
  process.exit(1);
}
