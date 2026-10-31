import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Checks the frontend skill contract without inspecting implementation intent.
 *
 * The checker deliberately validates only deterministic references and metadata;
 * component reuse and semantic HTML remain review responsibilities.
 */
export function collectFrontendContractErrors({
  skillContents,
  implementationWorkflowContents,
  reviewWorkflowContents,
  agentsContents,
}) {
  const errors = [];
  const skill = typeof skillContents === "string" ? skillContents : "";
  const implementationWorkflow =
    typeof implementationWorkflowContents === "string"
      ? implementationWorkflowContents
      : "";
  const reviewWorkflow =
    typeof reviewWorkflowContents === "string" ? reviewWorkflowContents : "";
  const agents = typeof agentsContents === "string" ? agentsContents : "";

  if (!skill.trim()) {
    errors.push("Frontend contract skill must be non-empty");
  }

  if (
    !/^---\r?\nname:\s*vidora-frontend-contracts\s*\r?\ndescription:\s*.+\r?\n---/m.test(
      skill,
    )
  ) {
    errors.push(
      "Frontend contract skill must have valid name/description frontmatter",
    );
  }

  const requiredSkillReferences = [
    "AGENTS.md",
    "instructions/project-organization.md",
    "instructions/components.md",
    "instructions/frontend-implementation.md",
    "instructions/functions-and-types.md",
  ];

  for (const reference of requiredSkillReferences) {
    if (!skill.includes(reference)) {
      errors.push(
        `.agents/skills/vidora-frontend-contracts/SKILL.md must reference ${reference}`,
      );
    }
  }

  const skillPath = ".agents/skills/vidora-frontend-contracts/SKILL.md";
  if (
    !/For every React\/Next\.js UI task, apply the project-local Skill:\s*```text\s*\.agents\/skills\/vidora-frontend-contracts\/SKILL\.md\s*```/s.test(
      implementationWorkflow,
    )
  ) {
    errors.push(
      `.agents/skills/implement-roadmap-task/SKILL.md must reference ${skillPath}`,
    );
  }
  if (
    !/Also apply:\s*```text\s*\.agents\/skills\/vidora-frontend-contracts\/SKILL\.md\s*```/s.test(
      reviewWorkflow,
    )
  ) {
    errors.push(
      `.agents/skills/review-roadmap-task/SKILL.md must reference ${skillPath}`,
    );
  }

  if (
    !agents.includes(
      "Do not create commits or push changes without explicit user approval.",
    )
  ) {
    errors.push(
      "AGENTS.md must preserve explicit owner authorization for Git writes",
    );
  }

  return errors;
}

/**
 * Rejects ambiguous generic support filenames in application-owned component
 * directories while leaving generated shared UI primitives untouched.
 */
export function collectGenericComponentFileErrors(relativePaths) {
  const errors = [];
  const genericNames = new Set([
    "constants.ts",
    "constants.test.ts",
    "types.ts",
    "types.test.ts",
    "utils.ts",
    "utils.test.ts",
  ]);

  for (const relativePath of relativePaths) {
    const normalizedPath = relativePath.replaceAll("\\", "/");
    if (
      !normalizedPath.includes("/components/") ||
      normalizedPath.startsWith("src/components/ui/")
    ) {
      continue;
    }

    const filename = normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);
    if (genericNames.has(filename)) {
      errors.push(
        `${normalizedPath} must use an owner-prefixed component support filename`,
      );
    }
  }

  return errors;
}

function listFiles(root, relativeDirectory) {
  const absoluteDirectory = join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(root, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

export function collectAgentToolingErrors(root = process.cwd()) {
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

  const frontendSkill = assertNonEmpty(
    ".agents/skills/vidora-frontend-contracts/SKILL.md",
  );
  const implementationWorkflow = assertNonEmpty(
    ".agents/skills/implement-roadmap-task/SKILL.md",
  );
  const reviewWorkflow = assertNonEmpty(
    ".agents/skills/review-roadmap-task/SKILL.md",
  );
  const agents = assertNonEmpty("AGENTS.md");

  if (
    frontendSkill !== null &&
    implementationWorkflow !== null &&
    reviewWorkflow !== null &&
    agents !== null
  ) {
    errors.push(
      ...collectFrontendContractErrors({
        skillContents: frontendSkill,
        implementationWorkflowContents: implementationWorkflow,
        reviewWorkflowContents: reviewWorkflow,
        agentsContents: agents,
      }),
    );
  }

  errors.push(...collectGenericComponentFileErrors(listFiles(root, "src")));

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

  return errors;
}

const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    fileURLToPath(pathToFileURL(process.argv[1]));

if (isDirectExecution) {
  const errors = collectAgentToolingErrors();
  if (errors.length > 0) {
    console.error("check-agent-tooling failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("check-agent-tooling passed");
}
