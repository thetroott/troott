---
name: pacepard-to-code
description: "Entry skill for Figma-to-code using pacepard-ui-agent: points to implement-design, product pacepard-skills (specs/tasks/code), and the meta MCP skill. Use when the user says 'Figma to code', 'build UI from Figma', or similar without specifying a workflow."
disable-model-invocation: false
---

# Pacepard — Figma to code (routing)

## When to use

User wants **application code** from a Figma design using this repository’s bridge (**pacepard-ui-agent**).

## Load order

1. **[pacepard-ui-agent](../pacepard-ui-agent/SKILL.md)** — relay, plugin, `join_channel`, tool ladder.
2. Choose one path:
   - **Direct implementation:** **[pacepard-implement-design](../pacepard-implement-design/SKILL.md)**.
   - **Spec-first product flow:** **[pacepard-skills README](../../pacepard-skills/README.md)** — extract → UI spec → flow → tasks → code (and optional `.cursor/commands` `/pacepard …`).
3. **Design system rules** for the repo: **[pacepard-create-design-system-rules](../pacepard-create-design-system-rules/SKILL.md)**.

## Not this skill

- **Canvas writes in Figma** (`use_figma`): **[pacepard-use](../pacepard-use/SKILL.md)** — requires **Figma hosted MCP**.
