import { describe, expect, it } from "vitest";
import {
  collectAgentToolingErrors,
  collectComponentPropsContractErrors,
  collectComponentDirectoryErrors,
  collectGenericOwnedFileErrors,
  collectFrontendContractErrors,
  collectGenericComponentFileErrors,
} from "./check-agent-tooling.mjs";

const validFixture = {
  skillContents: `---
name: vidora-frontend-contracts
description: Enforce frontend contracts.
---
AGENTS.md
instructions/project-organization.md
instructions/components.md
instructions/frontend-implementation.md
instructions/functions-and-types.md
every application-owned React component in the changed scope
corresponding
\`<component-name>.types.ts\` file
private components
## Phase 1 — Repository discovery
## Phase 2 — Component architecture plan
## Phase 3 — Implementation against the plan
## Phase 4 — Independent contract verification
## Phase 5 — Remediation loop
every application-owned React component that accepts props
corresponding \`*.types.ts\` companion file
private components
The shared organization policy in`,
  implementationWorkflowContents:
    "For every React/Next.js UI task, apply the project-local Skill:\n```text\n.agents/skills/vidora-frontend-contracts/SKILL.md\n```\nlogical TypeScript/TSX units",
  reviewWorkflowContents:
    "Also apply:\n```text\n.agents/skills/vidora-frontend-contracts/SKILL.md\n```\nevery changed logical TypeScript/TSX unit",
  agentsContents:
    "Do not create commits or push changes without explicit user approval.",
};

describe("frontend contract tooling checks", () => {
  it("accepts a complete skill and workflow wiring", () => {
    expect(collectFrontendContractErrors(validFixture)).toEqual([]);
  });

  it("reports missing workflow wiring and invalid skill metadata", () => {
    const errors = collectFrontendContractErrors({
      ...validFixture,
      skillContents: validFixture.skillContents.replace(
        "name: vidora-frontend-contracts",
        "name: frontend-contracts",
      ),
      implementationWorkflowContents: "",
    });

    expect(errors).toEqual([
      "Frontend contract skill must have valid name/description frontmatter",
      ".agents/skills/implement-roadmap-task/SKILL.md must reference logical TypeScript/TSX unit organization",
      ".agents/skills/implement-roadmap-task/SKILL.md must reference .agents/skills/vidora-frontend-contracts/SKILL.md",
    ]);
  });

  it("reports a skill that omits an execution phase", () => {
    const errors = collectFrontendContractErrors({
      ...validFixture,
      skillContents: validFixture.skillContents.replace(
        "## Phase 4 — Independent contract verification\n",
        "",
      ),
    });

    expect(errors).toEqual([
      ".agents/skills/vidora-frontend-contracts/SKILL.md must define ## Phase 4 — Independent contract verification",
    ]);
  });

  it("reports missing canonical references and owner authorization", () => {
    const errors = collectFrontendContractErrors({
      ...validFixture,
      skillContents: validFixture.skillContents.replace(
        "instructions/components.md",
        "",
      ),
      agentsContents: "",
    });

    expect(errors).toEqual([
      ".agents/skills/vidora-frontend-contracts/SKILL.md must reference instructions/components.md",
      "AGENTS.md must preserve explicit owner authorization for Git writes",
    ]);
  });

  it("passes through the real repository checker", () => {
    expect(collectAgentToolingErrors(process.cwd())).toEqual([]);
  });

  it("rejects generic support filenames but preserves shared UI exceptions", () => {
    expect(
      collectGenericComponentFileErrors([
        "src/modules/footage/public/components/card/utils.ts",
        "src/components/ui/types.ts",
        "src/modules/footage/public/components/card/card.utils.ts",
      ]),
    ).toEqual([
      "src/modules/footage/public/components/card/utils.ts must use an owner-prefixed component support filename",
    ]);
  });

  it("requires multi-file application components to use a component directory", () => {
    expect(
      collectComponentDirectoryErrors([
        "src/modules/footage/public/search-view.tsx",
        "src/modules/footage/public/search-view.types.ts",
        "src/modules/footage/public/search-view.test.tsx",
      ]),
    ).toEqual([
      "src/modules/footage/public/search-view.tsx and its associated files must be colocated in a search-view/ directory",
    ]);
    expect(
      collectComponentDirectoryErrors([
        "src/modules/footage/public/search-view/search-view.tsx",
        "src/modules/footage/public/search-view/search-view.types.ts",
        "src/modules/footage/public/search-view/search-view.test.tsx",
      ]),
    ).toEqual([]);
  });

  it("rejects generic support files inside a scoped logical-unit directory", () => {
    expect(
      collectGenericOwnedFileErrors([
        "src/modules/search/search-query/search-query.ts",
        "src/modules/search/search-query/types.ts",
      ]),
    ).toEqual([
      "src/modules/search/search-query/types.ts must use an owner-prefixed support filename such as search-query.types.ts",
    ]);
    expect(
      collectGenericOwnedFileErrors([
        "src/modules/search/search-query/search-query.ts",
        "src/modules/search/search-query/search-query.types.ts",
      ]),
    ).toEqual([]);
  });

  it("accepts a props contract imported from the matching companion file", () => {
    expect(
      collectComponentPropsContractErrors({
        relativePath: "src/modules/footage/components/price-fields.tsx",
        sourceText: `import type { PriceFieldsProps } from "./price-fields.types";
export function PriceFields(props: PriceFieldsProps) { return <div />; }`,
        availablePaths: [
          "src/modules/footage/components/price-fields.tsx",
          "src/modules/footage/components/price-fields.types.ts",
        ],
      }),
    ).toEqual([]);
  });

  it("rejects inline, locally declared, and missing companion props contracts", () => {
    const inlineErrors = collectComponentPropsContractErrors({
      relativePath: "src/modules/footage/components/price-fields.tsx",
      sourceText:
        "function PriceFields({ value }: { value: number }) { return <div />; }",
      availablePaths: [],
    });
    const localErrors = collectComponentPropsContractErrors({
      relativePath: "src/modules/footage/components/price-fields.tsx",
      sourceText:
        "type PriceFieldsProps = { value: number }; function PriceFields(props: PriceFieldsProps) { return <div />; }",
      availablePaths: [],
    });
    const missingErrors = collectComponentPropsContractErrors({
      relativePath: "src/modules/footage/components/price-fields.tsx",
      sourceText:
        "import type { PriceFieldsProps } from './price-fields.types'; function PriceFields(props: PriceFieldsProps) { return <div />; }",
      availablePaths: [],
    });

    expect(inlineErrors[0]).toContain("must not use an inline props type");
    expect(localErrors[0]).toContain("must import PriceFieldsProps");
    expect(missingErrors[0]).toContain("missing companion file");
  });

  it("does not flag no-props components or generated UI primitives", () => {
    expect(
      collectComponentPropsContractErrors({
        relativePath: "src/modules/footage/components/empty-results.tsx",
        sourceText: "function EmptyResults() { return <div />; }",
      }),
    ).toEqual([]);
    expect(
      collectComponentPropsContractErrors({
        relativePath: "src/components/ui/card.tsx",
        sourceText:
          "function Card({ children }: { children: unknown }) { return <div />; }",
      }),
    ).toEqual([]);
  });
});
