# Normalized design scales (Troott)

Raw audit: [figma-raw-audit.md](./figma-raw-audit.md). Clustering rules: 4px spacing grid; radius sm = 4 (Figma CTA); typography aligned to Matter + Tailwind steps.

## Typography scale

| Token | px  | lineHeight | Notes                   |
| ----- | --- | ---------- | ----------------------- |
| xs    | 12  | 16         | captions                |
| sm    | 14  | 20         | secondary body          |
| base  | 16  | 24         | body, buttons (Figma)   |
| lg    | 18  | 26         |                         |
| xl    | 20  | 24         | splash headline (Figma) |
| 2xl   | 24  | 32         |                         |
| 3xl   | 28  | 36         |                         |
| 4xl   | 32  | 40         |                         |

Weights: **regular** 400, **medium** 500, **semibold** 600, **bold** 700 (Matter files).

## Spacing scale

| Token | px  |
| ----- | --- |
| 0     | 0   |
| 1     | 4   |
| 2     | 8   |
| 3     | 12  |
| 4     | 16  |
| 5     | 20  |
| 6     | 24  |
| 8     | 32  |
| 10    | 40  |
| 12    | 48  |

Maps to Tailwind `p-4` = 16, etc. (default Tailwind spacing already 4px-based; extended semantic aliases below).

## Radius scale

| Token | px   |
| ----- | ---- | ------------- |
| none  | 0    |
| sm    | 4    | Figma buttons |
| md    | 8    |               |
| lg    | 12   |               |
| xl    | 16   |               |
| 2xl   | 24   |               |
| full  | 9999 |

## Semantic colors (dark-first)

| Role                  | Hex       | Notes                      |
| --------------------- | --------- | -------------------------- |
| background            | `#171717` | canvas                     |
| foreground            | `#e8e8e8` | primary text on background |
| muted                 | `#9d9d9d` | grey.300                   |
| mutedForeground       | `#707070` | grey.400                   |
| card                  | `#252525` | pill / elevated            |
| cardForeground        | `#f7f7f7` | grey.50                    |
| border                | `#292929` | grey.600                   |
| borderStrong          | `#eaeaea` | outline CTA stroke         |
| primary               | `#08FFDB` | CTA                        |
| primaryForeground     | `#1d1d1d` | on-primary                 |
| destructive           | `#f00707` | red.500                    |
| destructiveForeground | `#ffffff` |

## Extended palettes

-   **primary** (teal): 50–900 from codebase teal scale.
-   **neutral**: grey 50–950 + black entries for true black overlays.
