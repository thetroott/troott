# Installing Pacepard skills globally (or per project)

## MCP server

Configure Cursor (or compatible client) with MCP server **`pacepard-ui-agent`**. Example config is in [`src/ui-power/mcp.json`](../src/ui-power/mcp.json).

You must run:

1. **`bun socket`** — WebSocket relay (this repo).
2. **Figma plugin** — Pacepard UI Agent, same channel as tool **`join_channel`**.

See [`src/ui-power/COMPATIBILITY.md`](../src/ui-power/COMPATIBILITY.md).

## Skills folders in this repo

| Folder | Role |
|--------|------|
| **`skills/`** | Agent SKILL.md packs (engineering + Figma Plugin API guides). |
| **`pacepard-skills/`** | Product-layer markdown (specs, flows, tasks, code workflow). |

## Copy / symlink

Copy or symlink **`skills/`** and optionally **`pacepard-skills/`** into the location your Cursor version uses for **project skills** or **user skills** (see current Cursor documentation for paths on macOS / Windows / Linux).

After copying, keep relative layout so links like `../../src/ui-power/COMPATIBILITY.md` still resolve **or** adjust paths for your install layout.

## Slash commands (optional)

If this repo’s **`.cursor/commands/`** is present in your workspace, use:

- `/pacepard spec`, `/pacepard flow`, `/pacepard tasks`, `/pacepard code`

Otherwise open the files under **`pacepard-skills/`** listed in [`pacepard-skills/README.md`](../pacepard-skills/README.md).

## Plugin version

**`get_metadata`** / **`get_design_context`** require a matching plugin from this repo’s [`src/cursor_mcp_plugin/`](../src/cursor_mcp_plugin/).

## Regenerate product skills

Use [`pacepard-skills/CURSOR_PROMPT_PACEPARD_SKILLS.md`](../pacepard-skills/CURSOR_PROMPT_PACEPARD_SKILLS.md) in a Cursor chat.
