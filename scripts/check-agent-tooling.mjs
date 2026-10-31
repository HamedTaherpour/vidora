import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

/**
 * Checks the frontend skill contract and deterministic component conventions.
 *
 * The checker deliberately validates only deterministic references and metadata;
 * component reuse, semantic HTML, and the selected review scope remain review
 * responsibilities.
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

  const requiredWorkflowPhases = [
    "## Phase 1 — Repository discovery",
    "## Phase 2 — Component architecture plan",
    "## Phase 3 — Implementation against the plan",
    "## Phase 4 — Independent contract verification",
    "## Phase 5 — Remediation loop",
  ];

  const requiredStrictPropsLanguage = [
    "every application-owned React component in the changed scope",
    "corresponding\n`<component-name>.types.ts` file",
    "private components",
  ];

  for (const reference of requiredSkillReferences) {
    if (!skill.includes(reference)) {
      errors.push(
        `.agents/skills/vidora-frontend-contracts/SKILL.md must reference ${reference}`,
      );
    }
  }

  for (const phase of requiredWorkflowPhases) {
    if (!skill.includes(phase)) {
      errors.push(
        `.agents/skills/vidora-frontend-contracts/SKILL.md must define ${phase}`,
      );
    }
  }

  for (const phrase of requiredStrictPropsLanguage) {
    if (!skill.includes(phrase)) {
      errors.push(
        `.agents/skills/vidora-frontend-contracts/SKILL.md must state strict props rule: ${phrase}`,
      );
    }
  }

  if (!skill.includes("The shared organization policy in")) {
    errors.push(
      ".agents/skills/vidora-frontend-contracts/SKILL.md must reference the shared organization policy",
    );
  }
  if (!implementationWorkflow.includes("logical TypeScript/TSX units")) {
    errors.push(
      ".agents/skills/implement-roadmap-task/SKILL.md must reference logical TypeScript/TSX unit organization",
    );
  }
  if (!reviewWorkflow.includes("every changed logical TypeScript/TSX unit")) {
    errors.push(
      ".agents/skills/review-roadmap-task/SKILL.md must review logical TypeScript/TSX unit organization",
    );
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

/**
 * Enforces the dedicated-directory convention for a supplied component scope.
 * The scope is explicit so legacy flat components outside the current task do
 * not force an unrelated repository-wide migration.
 */
export function collectComponentDirectoryErrors(relativePaths) {
  const errors = [];
  const normalizedPaths = relativePaths.map((path) =>
    path.replaceAll("\\", "/"),
  );
  const pathSet = new Set(normalizedPaths);

  for (const relativePath of normalizedPaths) {
    if (!isApplicationComponentFile(relativePath)) continue;
    const filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
    const baseName = filename.slice(0, -".tsx".length);
    const directory = relativePath.slice(0, relativePath.lastIndexOf("/"));
    const associatedSuffixes = [
      `.types.ts`,
      `.constants.ts`,
      `.utils.ts`,
      `.test.tsx`,
      `.test.ts`,
    ];
    const hasAssociatedFile = associatedSuffixes.some((suffix) =>
      pathSet.has(`${directory}/${baseName}${suffix}`),
    );
    if (!hasAssociatedFile) continue;

    const directoryName = directory.slice(directory.lastIndexOf("/") + 1);
    if (directoryName !== baseName) {
      errors.push(
        `${relativePath} and its associated files must be colocated in a ${baseName}/ directory`,
      );
    }
  }

  return errors;
}

/** Rejects generic support filenames inside an explicitly scoped unit directory. */
export function collectGenericOwnedFileErrors(relativePaths) {
  const errors = [];
  const normalizedPaths = relativePaths.map((path) =>
    path.replaceAll("\\", "/"),
  );
  const pathSet = new Set(normalizedPaths);
  const genericNames = new Set(["types.ts", "constants.ts", "utils.ts"]);

  for (const relativePath of normalizedPaths) {
    const filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
    if (!genericNames.has(filename)) continue;
    const directory = relativePath.slice(0, relativePath.lastIndexOf("/"));
    const unitName = directory.slice(directory.lastIndexOf("/") + 1);
    const hasUnitImplementation = [".ts", ".tsx"].some((extension) =>
      pathSet.has(`${directory}/${unitName}${extension}`),
    );
    if (hasUnitImplementation) {
      errors.push(
        `${relativePath} must use an owner-prefixed support filename such as ${unitName}.${filename}`,
      );
    }
  }

  return errors;
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function hasJsx(node) {
  let found = false;
  function visit(current) {
    if (
      current.kind === ts.SyntaxKind.JsxElement ||
      current.kind === ts.SyntaxKind.JsxSelfClosingElement ||
      current.kind === ts.SyntaxKind.JsxFragment
    ) {
      found = true;
      return;
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

function isApplicationComponentFile(relativePath) {
  const normalizedPath = relativePath.replaceAll("\\", "/");
  return (
    /\.tsx$/.test(normalizedPath) &&
    !/\.test\.tsx$/.test(normalizedPath) &&
    !/\.spec\.tsx$/.test(normalizedPath) &&
    !normalizedPath.startsWith("src/components/ui/")
  );
}

/**
 * Audits application-owned component signatures in an explicitly supplied
 * scope. The caller supplies the changed file set so legacy violations can be
 * reported without making an unrelated full-repository refactor a prerequisite
 * for the tooling gate.
 */
export function collectComponentPropsContractErrors({
  relativePath,
  sourceText,
  availablePaths = [],
}) {
  const errors = [];
  const normalizedPath = relativePath.replaceAll("\\", "/");

  if (!isApplicationComponentFile(normalizedPath)) {
    return errors;
  }

  const sourceFile = ts.createSourceFile(
    normalizedPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const importedTypes = new Map();
  const localTypeNames = new Set();

  for (const statement of sourceFile.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    ) {
      localTypeNames.add(statement.name.text);
    }

    if (!ts.isImportDeclaration(statement) || !statement.importClause) {
      continue;
    }

    const moduleSpecifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(moduleSpecifier)) {
      continue;
    }

    const namedBindings = statement.importClause.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      importedTypes.set(element.name.text, moduleSpecifier.text);
    }
  }

  const availablePathSet = new Set(
    availablePaths.map((path) => path.replaceAll("\\", "/")),
  );

  function report(node, message) {
    const line =
      sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    errors.push(`${normalizedPath}:${line} ${message}`);
  }

  function inspectComponent(name, parameter) {
    if (!parameter) {
      return;
    }

    const typeNode = parameter.type;
    const expectedTypeName = `${name}Props`;
    const expectedModule = `./${toKebabCase(name)}.types`;
    const expectedCompanion = `${normalizedPath.slice(
      0,
      normalizedPath.lastIndexOf("/") + 1,
    )}${toKebabCase(name)}.types.ts`;

    if (!typeNode) {
      report(parameter, `component ${name} must use ${expectedTypeName}`);
      return;
    }

    if (ts.isTypeLiteralNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
      report(parameter, `component ${name} must not use an inline props type`);
      return;
    }

    if (!ts.isTypeReferenceNode(typeNode)) {
      report(parameter, `component ${name} must use ${expectedTypeName}`);
      return;
    }

    const typeName = typeNode.typeName.getText(sourceFile);
    if (typeName !== expectedTypeName) {
      report(
        parameter,
        `component ${name} must use the dedicated ${expectedTypeName} contract`,
      );
      return;
    }

    if (localTypeNames.has(expectedTypeName)) {
      report(
        parameter,
        `component ${name} must import ${expectedTypeName} from ${expectedCompanion}`,
      );
      return;
    }

    if (importedTypes.get(expectedTypeName) !== expectedModule) {
      report(
        parameter,
        `component ${name} must import ${expectedTypeName} from ${expectedModule}`,
      );
      return;
    }

    if (!availablePathSet.has(expectedCompanion)) {
      report(parameter, `missing companion file ${expectedCompanion}`);
    }
  }

  function visit(node) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      /^[A-Z]/.test(node.name.text)
    ) {
      if (hasJsx(node.body)) {
        inspectComponent(node.name.text, node.parameters[0], node);
      }
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const initializer = node.initializer;
      if (
        /^[A-Z]/.test(node.name.text) &&
        initializer &&
        (ts.isArrowFunction(initializer) ||
          ts.isFunctionExpression(initializer)) &&
        hasJsx(initializer.body)
      ) {
        inspectComponent(node.name.text, initializer.parameters[0], node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
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

  assertContains(
    "instructions/project-organization.md",
    "## 6.1 Logical code-unit ownership and companion files",
    "the shared logical code-unit organization policy",
  );
  assertContains(
    "instructions/project-organization.md",
    "When a unit has more than one associated file",
    "the companion-directory rule",
  );

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
  errors.push(
    ...collectComponentDirectoryErrors(
      listFiles(root, "src/modules/footage/public/search"),
    ),
  );
  errors.push(
    ...collectGenericOwnedFileErrors(
      listFiles(root, "src/modules/footage/public/search"),
    ),
  );

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
