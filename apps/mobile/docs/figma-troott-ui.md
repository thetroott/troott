# Troott UI vs Figma

**File:** [Troott (Figma)](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott)

**Reference nodes (examples):**

- [4081-19306](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4081-19306) — welcome / pre-auth (`app/index.tsx`: hero, logo, headline, CTAs)
- [8841-19674](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=8841-19674)
- [2950-19555](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=2950-19555)

## App shell (code)

| Figma intent                   | Implementation                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Dark canvas                    | Root `#171717`, `bg-neutral-950` on `ScreenView`, auth `SharedHeader`                                                    |
| App bar (title + side actions) | `Header` / `SharedHeader` from `@/components/containers/shared/headers` with `variant="playlist"` (left / title / right) |
| Auth titles                    | `SharedHeader` + `variant="auth"`                                                                                        |
| Error boundary                 | `FallbackComponent` from `@/components/containers/shared` (teal CTA)                                                     |

## Talk to Figma (MCP)

1. Open the file in Figma desktop, run **Cursor Talk to Figma MCP** plugin.
2. Join channel **`9lFM6TncipSv0pNVGBWZwA`** (file key) to match Cursor MCP `join_channel`.
3. Use MCP tools (`read_my_design`, `get_node_info`, …) with the file open.

## API layer

`api/` is for HTTP/data (axios, hooks). It does not render UI; keep loading/error UI in components using TanStack Query + shared shells above.
