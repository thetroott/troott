# Figma raw style audit (Troott)

Source: [Troott file](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott). Extracted via Talk-to-Figma MCP, node **1281:5046** (Splash Screen). Additional frames referenced in [figma-troott-ui.md](../figma-troott-ui.md).

Values below are **as measured in Figma** — not normalized.

## Frame: Splash Screen (1281:5046)

| Element                         | Property           | Raw value                     |
| ------------------------------- | ------------------ | ----------------------------- |
| Canvas                          | fill               | `#171717`                     |
| Canvas                          | size               | 375 x 812                     |
| Hero mask                       | height             | 453                           |
| Gradient overlay                | stop 0             | `#000000` / `#000000ed`       |
| Gradient overlay                | stop 1             | transparent                   |
| Full-screen wash                | fill               | `#000000` @ 10% opacity       |
| Logo                            | size               | 116 x 32                      |
| Body headline                   | fontFamily         | Matter                        |
| Body headline                   | fontStyle / weight | Regular / 400                 |
| Body headline                   | fontSize           | 20                            |
| Body headline                   | lineHeight         | 24                            |
| Body headline                   | letterSpacing      | 0                             |
| Body headline                   | fill               | `#e8e8e8`                     |
| Body headline                   | max width (inner)  | 343                           |
| Horizontal inset                | (375 - 343) / 2    | 16                            |
| Gap logo to copy                | (layout)           | 16                            |
| Gap copy to CTAs                | (layout)           | 32                            |
| Primary CTA                     | fill               | `#08ffdb`                     |
| Primary CTA                     | cornerRadius       | 4                             |
| Primary CTA                     | height             | 48                            |
| Primary CTA                     | width              | 343                           |
| Primary CTA label               | fontFamily         | Matter                        |
| Primary CTA label               | weight             | 600 (SemiBold)                |
| Primary CTA label               | fontSize           | 16                            |
| Primary CTA label               | lineHeight         | 24                            |
| Primary CTA label               | letterSpacing      | 0.16                          |
| Primary CTA label               | fill               | `#1d1d1d`                     |
| Outline CTA                     | stroke             | `#f7f7f7`                     |
| Outline CTA                     | cornerRadius       | 4                             |
| Outline CTA                     | height             | 48                            |
| Outline CTA label               | fill               | `#f7f7f7`                     |
| Outline CTA label               | typography         | same as primary label         |
| Gap between CTAs                |                    | 16                            |
| Gap below hero to content block |                    | 37 (812 scale)                |
| Status (system)                 | time text          | SF Pro Semibold 16, `#ffffff` |

## Typography families observed

| Family      | Usage                   |
| ----------- | ----------------------- |
| Matter      | Marketing copy, buttons |
| SF Pro Text | Status bar (platform)   |

## Colors observed (hex)

| Hex       | Usage                      |
| --------- | -------------------------- |
| `#171717` | App background             |
| `#e8e8e8` | Primary marketing text     |
| `#08ffdb` | Primary CTA fill           |
| `#1d1d1d` | On-primary label           |
| `#f7f7f7` | Outline border + label     |
| `#000000` | Overlays, gradients        |
| `#ffffff` | Status bar, home indicator |

## Spacing / layout (px)

| Value | Context                                  |
| ----- | ---------------------------------------- |
| 4     | Button radius                            |
| 16    | Screen gutter, stack gap                 |
| 32    | Section gap (copy to buttons)            |
| 37    | Hero to logo stack (proportional to 812) |
| 48    | Button height                            |
| 343   | Content column width @ 375               |
| 453   | Hero height @ 812                        |

## Borders

| Property            | Value                     |
| ------------------- | ------------------------- |
| Outline button      | 1px implied (stroke only) |
| cornerRadius (CTAs) | 4                         |

## Shadows

None called out on splash primitives in this node.
