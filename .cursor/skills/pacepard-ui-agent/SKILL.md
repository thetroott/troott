---
name: pacepard-ui-agent
description: 'MCP bridge skill for Pacepard UI Agent — Figma Desktop + WebSocket relay. Use when the user works with Figma from Cursor via pacepard-ui-agent, join_channel, get_metadata, get_design_context, get_screenshot, read_ui_power_steering, create_design_system_rules, or discrete canvas tools. Load before other Pacepard Figma skills so tool names and preconditions match this server.'
disable-model-invocation: false
---

# pacepard-ui-agent

## What this is

**pacepard-ui-agent** is the MCP server in this repository: stdio MCP to Cursor (or compatible clients), WebSocket to [`src/socket.ts`](../../src/socket.ts), and the **Pacepard UI Agent** Figma plugin executing commands in the open file.

It is **not** Figma’s hosted MCP (`mcp.figma.com`). It does **not** provide `use_figma`, Code Connect MCP tools, `whoami`, `create_new_file`, or `search_design_system`.

## Preconditions (all required)

1. **Relay:** Run `bun socket` (default port **3055**) from this repo.
2. **Plugin:** Open Figma Desktop, run the **Pacepard UI Agent** plugin, join the **same channel** you pass to MCP tool **`join_channel`**.
3. **File:** The target `.fig` must be **open** in Figma Desktop. The bridge targets the **current file** only (no remote open-by-URL).

Canonical contract: [`src/ui-power/COMPATIBILITY.md`](../../src/ui-power/COMPATIBILITY.md).

## Tool ladder (codegen and large frames)

Call in order when exploring or implementing from Figma:

1. **`join_channel`** — required first.
2. **`get_metadata`** — shallow tree (`maxDepth` / `maxNodes`); use `truncated` to decide drill-down.
3. **`get_design_context`** — Pacepard v1 structured snapshot (`contextVersion` in payload).
4. **`get_screenshot`** — visual source of truth (PNG `image` content).

For full raw node JSON when needed: **`get_node_info`**, **`get_nodes_info`**, **`read_my_design`**.

## Steering markdown (not `readPowerSteering`)

Cursor Powers may mention `readPowerSteering("figma", "...")` — that is **client-only**. On this MCP use:

- **`read_ui_power_steering`** with `relativePath` such as `POWER.md`, `steering/implement-design.md`, `COMPATIBILITY.md` (paths under bundled `src/ui-power`).

## Hosted-only features

If the user needs **`use_figma`**, hosted Code Connect tools, `whoami`, FigJam generators, etc., they need **Figma hosted MCP** in addition or instead — see [`src/ui-power/OPTIONAL_HOSTED_MCP.md`](../../src/ui-power/OPTIONAL_HOSTED_MCP.md).

## Plugin version

**`get_metadata`** and **`get_design_context`** require a **matching** plugin `code.js` from this repository. If commands fail with unknown command, relink/update the plugin from [`src/cursor_mcp_plugin/`](../../src/cursor_mcp_plugin/).

## Related skills

- **Product artifacts (specs, flows, tasks, code):** follow [`pacepard-skills/README.md`](../../pacepard-skills/README.md) under repo root.
- **Implement repo code from Figma:** [`pacepard-implement-design`](../pacepard-implement-design/SKILL.md).
- **Design system rules artifact:** [`pacepard-create-design-system-rules`](../pacepard-create-design-system-rules/SKILL.md).
- **Canvas writes via Plugin API** (`use_figma`): only with **Figma hosted MCP** — see [`pacepard-use`](../pacepard-use/SKILL.md) (MCP requirement block at top).

## Global copy

Symlink or copy `skills/` (and optionally `pacepard-skills/`) into your Cursor skills path; keep MCP server key **`pacepard-ui-agent`** in `.cursor/mcp.json` per [`src/ui-power/mcp.json`](../../src/ui-power/mcp.json). See [`skills/INSTALL.md`](../INSTALL.md).
