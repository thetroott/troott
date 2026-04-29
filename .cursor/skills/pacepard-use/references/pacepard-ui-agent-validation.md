# Validating Figma state with pacepard-ui-agent (no `use_figma`)

Use this when the file is **open in Figma Desktop** with the **Pacepard UI Agent** plugin and **`bun socket`** running.

## Preconditions

1. `join_channel` (same channel as plugin UI).
2. Optional: `set_selections` / `set_focus` on the node you care about.

## Structural checks

- **`get_metadata`** — shallow tree, counts, bounds; cheap between steps.
- **`get_design_context`** — structured snapshot for codegen-oriented fields.

## Visual checks

- **`get_screenshot`** — after major milestones (not after every tiny edit).

## When this is not enough

Canvas **writes** that need traversals, `combineAsVariants`, bulk variable creation, etc. still require **`use_figma`** on **Figma hosted MCP** — load **[pacepard-use](../SKILL.md)** for those workflows only when that MCP is available.
