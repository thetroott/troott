---
name: pacepard-implement-design
description: Translates Figma designs into production-ready application code with 1:1 visual fidelity using pacepard-ui-agent (plugin MCP). Use when implementing UI from Figma, user provides Figma URLs or node ids, or asks to match Figma specs. For canvas writes via use_figma (hosted MCP), use pacepard-use.
disable-model-invocation: false
---

# Implement Design (pacepard-ui-agent)

## Overview

Structured workflow to translate Figma into **repository code** with strong visual parity, using **pacepard-ui-agent** tools (not Figma hosted MCP).

## Skill boundaries

- **Code in repo:** this skill.
- **Mutate Figma canvas** with Plugin API scripts: **[pacepard-use](../pacepard-use/SKILL.md)** — requires **Figma hosted MCP `use_figma`**, not pacepard-ui-agent alone.
- **Build full screens inside Figma from code/description:** **[pacepard-generate-design](../pacepard-generate-design/SKILL.md)** (hosted `use_figma` path).
- **Code Connect MCP suggestions:** **[pacepard-code-connect](../pacepard-code-connect/SKILL.md)** — hosted-only tools; use template workflow if only pacepard-ui-agent.
- **Project rule files:** **[pacepard-create-design-system-rules](../pacepard-create-design-system-rules/SKILL.md)**.
- **Specs / flows / tasks artifacts first:** **[pacepard-skills](../../pacepard-skills/README.md)** product layer + slash commands.

## Prerequisites

Load **[pacepard-ui-agent](../pacepard-ui-agent/SKILL.md)** first.

1. **`bun socket`** and Figma **Pacepard UI Agent** plugin on the **same channel** as **`join_channel`**.
2. Target **.fig** file **open** in Figma Desktop (bridge does not open remote files by URL alone).
3. **Node id** for the frame/component (`42:15` or URL form `42-15` — server normalizes). Optional **`fileKey`** from URL for validation against open file — see [`src/ui-power/COMPATIBILITY.md`](../../src/ui-power/COMPATIBILITY.md).

## Required workflow

### Step 1: Resolve node (and optional fileKey)

**From URL:** `https://www.figma.com/design/:fileKey/...?node-id=42-15` → `fileKey`, `nodeId` (normalize hyphens to colons).

**From selection:** `get_selection` then use selected node ids (no URL required if user has selected the right node).

Use **`set_selections`** / **`set_focus`** if you need to target a specific id from the URL before reads.

### Step 2: Ladder — fetch structured context

1. **`join_channel`**
2. **`get_metadata`** on `nodeId` (tune `maxDepth` / `maxNodes`; watch `truncated`)
3. **`get_design_context`** on `nodeId` (and children if large)
4. Optional: **`read_ui_power_steering`** with `relativePath: steering/implement-design.md` for aligned wording

If payload too large: drill with `get_metadata` → per-child **`get_design_context`**.

### Step 3: Visual reference

**`get_screenshot`** on the same `nodeId` (and optional `fileKey` per tool schema). Use MCP `image` content for parity checks.

### Step 4: Assets

pacepard-ui-agent **does not** expose a Figma-hosted “localhost assets CDN.” For raster/SVG needs:

- Use **`export_node_as_image`** on exportable nodes where appropriate, **or**
- Add assets to the repo under the project’s `public/` / asset pipeline and reference paths in code.

Do not assume mystery localhost asset URLs from generic Figma MCP docs.

### Step 5: Translate to project conventions

- Treat design-context fields as **intent**, not final class names.
- Reuse existing components and tokens.
- Respect routing, state, and data patterns.

### Step 6: Parity and a11y

Match screenshot and structured layout; document intentional deviations.

### Step 7: Validate

Checklist: layout, type, color, states, responsive behavior, assets, a11y.

## Implementation rules

Same as before: design system first, composable components, TypeScript types, avoid hardcoded values where tokens exist.

## Common issues

- **Truncated context:** more `get_metadata` + targeted `get_design_context` on child ids.
- **Wrong file:** `fileKey` mismatch returns error — open the correct file or omit `fileKey`.
- **Assets:** use export tools or manual pipeline — not hosted MCP asset endpoint.

## Resources

- [`src/ui-power/COMPATIBILITY.md`](../../src/ui-power/COMPATIBILITY.md)
- [`src/ui-power/OPTIONAL_HOSTED_MCP.md`](../../src/ui-power/OPTIONAL_HOSTED_MCP.md) (if you also use Figma hosted MCP)
- [Figma Variables](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
