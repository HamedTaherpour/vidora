# Vidora agent tooling inventory

This inventory records the agent-tooling cleanup for
`VIDORA-AGENT-CLEANUP-01`. It is intentionally library-independent. The
repository's engineering rules remain authoritative; skills provide workflows
and navigation only.

## Classification

| Skill                           | Decision | Responsibility / evidence                                                                                                  |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `better-accessibility`          | KEEP     | WCAG-focused keyboard, naming, focus, motion, zoom, and announcement review.                                               |
| `better-colors`                 | KEEP     | Library-independent color-token and contrast review.                                                                       |
| `better-interface`              | KEEP     | Cross-discipline interface review orchestration.                                                                           |
| `better-layout`                 | KEEP     | Grouping, alignment, responsive structure, and logical RTL layout.                                                         |
| `better-typography`             | KEEP     | Type scale, wrapping, numeric rendering, bidi, and text-resize review.                                                     |
| `better-ui`                     | KEEP     | Surface, icon, interaction-motion, and polish review.                                                                      |
| `better-writing`                | KEEP     | UI copy, error, empty-state, and action-label review.                                                                      |
| `break`                         | KEEP     | Rendered component stress testing across adverse content and states.                                                       |
| `code-review`                   | KEEP     | Standards/spec review of a fixed diff.                                                                                     |
| `codebase-design`               | KEEP     | Deep-module and testability design vocabulary.                                                                             |
| `diagnosing-bugs`               | KEEP     | Reproduce, minimize, instrument, fix, and regress hard bugs.                                                               |
| `domain-modeling`               | KEEP     | Domain vocabulary, glossary, and ADR modeling.                                                                             |
| `grill-with-docs`               | KEEP     | Adversarial requirements clarification and documentation.                                                                  |
| `implement-roadmap-task`        | UPDATE   | Roadmap implementation workflow; component-library assumptions are now neutral.                                            |
| `improve-codebase-architecture` | KEEP     | Architecture exploration and deepening report.                                                                             |
| `interface-review`              | KEEP     | Change-scoped interface regression review; it delegates domain rules to the `better-*` skills.                             |
| `prototype`                     | KEEP     | Throwaway logic or UI exploration.                                                                                         |
| `retro`                         | KEEP     | Agent-session retrospective and tooling improvement proposals.                                                             |
| `review-roadmap-task`           | UPDATE   | Adversarial roadmap review; shadcn-specific reuse gates are now neutral.                                                   |
| `tdd`                           | KEEP     | Test-first implementation workflow when requested.                                                                         |
| `variant`                       | KEEP     | Deliberate UI alternatives; it does not mandate a component library.                                                       |
| `vidora-frontend-contracts`     | UPDATE   | Vidora UI ownership and verification contracts; library-specific requirements were removed during the concurrent UI reset. |
| `shadcn`                        | REMOVE   | Obsolete library-specific skill, CLI, registry, MCP, and Base UI guidance.                                                 |

No skills were merged. The design review skills have distinct ownership: the
`better-*` skills own domain criteria, `better-interface` consolidates them,
`interface-review` owns change scope/classification, and `variant`/`break` own
exploration and stress-testing workflows respectively.

## VibeFarsiUI integration

The official VibeFarsiUI repository and documentation were inspected and the
foundation is now configured. The official materials describe a copy-in project
registry with RTL-first components, Persian typography, Persian digits,
Toman/Jalali helpers, semantic color tokens, animation and background catalogs,
component discovery, page scaffolding, MCP tools, and Codex installation.

The complete integration procedure is documented in
`docs/VIBEFARSI-INTEGRATION.md`. Official sources are installed under
`.claude/skills/` by the VibeFarsi CLI, with Codex discovery bridges under
`.agents/skills/`.

Sources inspected:

- [VibeFarsiUI repository README](https://github.com/TronIsHere/vibefarsiui)
- [Official VibeFarsiUI skills catalog](https://vibefarsi.ir/skills)

The project does not add a runtime VibeFarsiUI dependency. Components remain
copy-in registry items and are added incrementally by future page tasks.

## Integrity contract

`pnpm check:agent-tooling` verifies that every retained skill has a valid
`SKILL.md` entrypoint and frontmatter, local markdown references resolve,
required engineering workflows remain present, and active guidance contains no
obsolete shadcn/Base UI mandate. Historical roadmap references may remain when
they accurately describe completed work, but they are not active instructions.
