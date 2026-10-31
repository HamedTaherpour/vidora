import { describe, expect, it } from "vitest";
import {
  collectAgentToolingErrors,
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
instructions/functions-and-types.md`,
  implementationWorkflowContents:
    "For every React/Next.js UI task, apply the project-local Skill:\n```text\n.agents/skills/vidora-frontend-contracts/SKILL.md\n```",
  reviewWorkflowContents:
    "Also apply:\n```text\n.agents/skills/vidora-frontend-contracts/SKILL.md\n```",
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
      ".agents/skills/implement-roadmap-task/SKILL.md must reference .agents/skills/vidora-frontend-contracts/SKILL.md",
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
});
