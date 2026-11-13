# VibeFarsiUI integration

Vidora uses [VibeFarsiUI](https://github.com/TronIsHere/vibefarsiui) as its
Persian RTL UI foundation. VibeFarsiUI is a copy-in registry, not a runtime UI
package: components are added only when a page needs them.

## Official project setup

The project registry is configured in `vibefarsi.json`:

- registry: `https://vibefarsi.ir/r`;
- theme: `graphite`;
- font: `vazirmatn`;
- Tailwind v4 CSS entrypoint: `src/app/globals.css`.

The official CLI is invoked with `npx vibefarsi@latest`. Use `npx vibefarsi
list` to inspect the catalog and `npx vibefarsi add <slug> --no-install` to add
an approved component, animation, background, theme, or skill. Do not bulk-add
visual components. Review generated files and adapt vendor-managed files only
as required by Vidora's ownership and type contracts.

The official foundation initialization command is `npx vibefarsi@latest init`.
It is intentionally not rerun blindly because it can update project CSS,
layout, agent guidance, and helper files. Existing Vidora RTL metadata and
Vazirmatn delivery were preserved, and the official graphite token block was
added through the CLI.

## Codex MCP

The user-level Codex MCP entry is registered with the official command:

```text
codex mcp add vibefarsi --url https://vibefarsi.ir/mcp
```

Verify with `codex mcp list`. A fresh Codex session may be required before the
new server appears in the active tool inventory.

The server's read-only tools are `get_design_rules`, `search_registry`,
`get_component`, `get_theme`, and `scaffold_page`. For UI work, call
`get_design_rules` first, then use registry discovery before selecting files.
Never put tokens or machine-specific credentials in this repository.

## Official skills

The official CLI-installed sources live under `.claude/skills/` and the two
official guides live under `docs/`:

- `persian-rtl-ui`: RTL layout and logical CSS;
- `persian-typography`: Persian type, wrapping, bidi, and numeric rendering;
- `persian-ui-copy`: labels, errors, empty states, and notifications;
- `persian-formal` and `persian-conversational`: copy registers;
- `persian-seo`: Persian metadata and indexable public copy;
- `jalali-calendar`: Persian calendar behavior;
- `iran-validation`: Iranian form validation patterns;
- `docs/agents-md-persian.md`: compact agent rules;
- `docs/ui-craft-rules.md`: responsive, motion, performance, and craft checks.

Codex discovery bridges in `.agents/skills/` point to those official sources
while preserving Vidora's canonical skill location and engineering contracts.

## Future UI workflow

For each UI task, read the product requirements and route inventory, identify
purpose and states, consult the relevant skill, call the VibeFarsi MCP, choose a
coherent composition, and add only the required registry items. Then adapt the
result to Vidora module ownership, companion type contracts, server/client
boundaries, and business-logic placement. Verify Persian RTL, responsive
behavior, keyboard and screen-reader access, performance, reduced motion, and
tests. Animation and decorative backgrounds are optional and must serve the
page rather than become a default.

No application page is redesigned by this foundation task.
