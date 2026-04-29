# Troott design system

Dark-first tokens and primitives for NativeWind. Figma audit and normalized scales live alongside this doc.

## Docs

| Doc                                                  | Purpose                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| [figma-raw-audit.md](./figma-raw-audit.md)           | Raw values from Figma (Splash frame)                                    |
| [figma-styles.md](./figma-styles.md)                 | Document structure, color/text styles, Button set (MCP)                 |
| [figma-primitives-gap.md](./figma-primitives-gap.md) | Figma nodes vs components/ui vs rn-primitives; missing primitives added |
| [normalized-scales.md](./normalized-scales.md)       | Typography, spacing, radius, semantic roles                             |

## Token source of truth

-   **Tailwind:** `theme.extend` is populated from [`constants/tailwind-bridge.cjs`](../../constants/tailwind-bridge.cjs) (required by `tailwind.config.js`).
-   **JS (Reanimated, icons):** import [`semanticColors`](../../constants/tailwind-bridge.ts) from `@/constants/tailwind-bridge` or `@/constants` — hex values stay aligned with the CJS bridge.

## Canonical UI imports

Use these for new code:

```tsx
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { VStack, HStack, ScreenSection } from '@/components/ui/layout';
```

-   **Text:** `variant`, `weight`, `tone` (`foreground` | `muted` | `primary` | `onPrimary` | `destructive` | `card`), `className`, Slot / `asChild`.
-   **Button:** variants `primary` | `secondary` | `tertiary` | `error` | `outline` | `ghost`; primary/outline/ghost colors track semantic tokens.
-   **Layout:** `VStack` / `HStack` (gap, justify, align), `ScreenSection` (inset) — Figma-friendly stack rhythm; use with `className` for padding/bg/rounded.

## Semantic Tailwind colors (dark shell)

Examples: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-destructive`.

## Legacy `shared/ui`

`components/shared/ui/text`, `button`, and `card` re-export or wrap the canonical components. Prefer `@/components/ui/*` for new screens.

## Theme note

The app shell is **dark-first**. Cards use `bg-card` and `border-border`, not light `bg-white` defaults.
