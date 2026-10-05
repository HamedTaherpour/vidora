import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function rel(path) {
  return path.replaceAll("\\", "/");
}

function resolve(...parts) {
  return join(root, ...parts);
}

function fail(message) {
  errors.push(message);
}

function assertExists(relativePath) {
  const absolutePath = resolve(relativePath);
  if (!existsSync(absolutePath)) {
    fail(`Missing required file: ${rel(relativePath)}`);
    return null;
  }
  return absolutePath;
}

function assertNonEmpty(relativePath) {
  const absolutePath = assertExists(relativePath);
  if (!absolutePath) {
    return null;
  }

  const size = statSync(absolutePath).size;
  if (size === 0) {
    fail(`Required file is empty: ${rel(relativePath)}`);
    return null;
  }

  return readFileSync(absolutePath, "utf8");
}

function assertContains(relativePath, needle, label = needle) {
  const contents = assertNonEmpty(relativePath);
  if (contents === null) {
    return;
  }

  if (!contents.includes(needle)) {
    fail(`${rel(relativePath)} must reference ${label}`);
  }
}

function assertAbsent(relativePath) {
  if (existsSync(resolve(relativePath))) {
    fail(`Forbidden path exists: ${rel(relativePath)}`);
  }
}

const requiredFiles = [
  "AGENTS.md",
  "docs/PROJECT.md",
  "docs/ROADMAP.md",
  "docs/adr/0001-nextjs-modular-monolith.md",
  "docs/adr/0002-postgresql-prisma.md",
  "docs/adr/0003-phone-otp-authentication.md",
  "docs/adr/0004-private-object-storage-media-delivery.md",
  "docs/adr/0005-buy-now-commerce-payment-entitlement-invoice.md",
  "docs/adr/0006-reject-better-auth.md",
  "docs/adr/0007-separate-admin-identity-and-session.md",
  "instructions/architecture.md",
  "instructions/implementation.md",
  "instructions/project-organization.md",
  "instructions/frontend-implementation.md",
  "instructions/functions-and-types.md",
  "instructions/ai-governance.md",
  "instructions/testing.md",
  "instructions/security.md",
  "instructions/database.md",
  "instructions/media.md",
  "instructions/commerce.md",
  "instructions/definition-of-done.md",
  ".agents/skills/implement-roadmap-task/SKILL.md",
  ".agents/skills/review-roadmap-task/SKILL.md",
  ".cursor/rules/project-governance.mdc",
];

for (const relativePath of requiredFiles) {
  assertNonEmpty(relativePath);
}

const adrTitles = [
  ["docs/adr/0001-nextjs-modular-monolith.md", "# ADR-0001:"],
  ["docs/adr/0002-postgresql-prisma.md", "# ADR-0002:"],
  ["docs/adr/0003-phone-otp-authentication.md", "# ADR-0003:"],
  ["docs/adr/0004-private-object-storage-media-delivery.md", "# ADR-0004:"],
  [
    "docs/adr/0005-buy-now-commerce-payment-entitlement-invoice.md",
    "# ADR-0005:",
  ],
  ["docs/adr/0006-reject-better-auth.md", "# ADR-0006:"],
  ["docs/adr/0007-separate-admin-identity-and-session.md", "# ADR-0007:"],
];

for (const [relativePath, title] of adrTitles) {
  const contents = assertExists(relativePath)
    ? readFileSync(resolve(relativePath), "utf8")
    : null;
  if (contents !== null && !contents.includes(title)) {
    fail(`${rel(relativePath)} must contain ADR heading ${title}`);
  }
}

assertAbsent(".cursor/skills");
assertAbsent(".codex/skills");

assertContains(
  ".agents/skills/implement-roadmap-task/SKILL.md",
  "AGENTS.md",
  "AGENTS.md",
);
assertContains(
  ".agents/skills/implement-roadmap-task/SKILL.md",
  "docs/PROJECT.md",
  "docs/PROJECT.md",
);
assertContains(
  ".agents/skills/implement-roadmap-task/SKILL.md",
  "docs/ROADMAP.md",
  "docs/ROADMAP.md",
);
assertContains(
  ".agents/skills/review-roadmap-task/SKILL.md",
  "AGENTS.md",
  "AGENTS.md",
);
assertContains(
  ".agents/skills/review-roadmap-task/SKILL.md",
  "docs/PROJECT.md",
  "docs/PROJECT.md",
);
assertContains(
  ".agents/skills/review-roadmap-task/SKILL.md",
  "docs/ROADMAP.md",
  "docs/ROADMAP.md",
);

assertContains(
  ".cursor/rules/project-governance.mdc",
  "AGENTS.md",
  "AGENTS.md",
);

assertContains("AGENTS.md", "docs/PROJECT.md", "docs/PROJECT.md");
assertContains("AGENTS.md", "docs/ROADMAP.md", "docs/ROADMAP.md");
assertContains("AGENTS.md", "docs/adr/", "docs/adr/");
assertContains("AGENTS.md", "instructions/", "instructions/");

if (errors.length > 0) {
  console.error("check-agent-tooling failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("check-agent-tooling passed");
