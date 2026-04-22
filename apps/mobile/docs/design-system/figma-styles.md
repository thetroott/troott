# Figma document styles (Troott)

Source: [Troott file](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott). Fetched via Talk-to-Figma MCP (`get_styles`, `get_document_info`, `get_node_info`). Channel used: `7t5m5zh5` (see [figma-mcp.md](../figma-mcp.md)).

## Document structure (page: Mobile Screens, id 788:5451)

Sections and key frames:

| Section / frame             | Node id                                     | Notes     |
| --------------------------- | ------------------------------------------- | --------- |
| Splash Screen               | 1166:6100 (section), 4081:19306, 7070:20310 |           |
| Your Interests              | 1166:6103, 9267:26419                       |           |
| Logging In                  | 1166:6099                                   |           |
| Forgotten Password          | 2300:8524                                   |           |
| Create Account              | 1166:6101                                   |           |
| Verification                | 1166:6102                                   |           |
| Home                        | 2781:24279                                  |           |
| Playing a sermon            | 2781:27306                                  |           |
| Pausing Sermon              | 2781:30872                                  |           |
| Sleep Timer                 | 2781:31995                                  |           |
| Profile                     | 4462:29795, 7968:21635                      |           |
| Notification-settings       | 5591:15162                                  |           |
| Help and Feedback           | 5591:15271                                  |           |
| About Troott                | 5591:15272                                  |           |
| Subscription                | 5591:15160                                  |           |
| Playlist + Error states     | 2947:17156                                  |           |
| Liked sermon + Error states | 8866:51992                                  |           |
| Downloading                 | 2950:19554                                  |           |
| Sharing Sermon              | 4430:44328                                  |           |
| Search-start                | 4827:13731                                  |           |
| Search-flow                 | 5591:16759                                  |           |
| Clear-recents, No-results   | 5591:16619, 5591:16690                      |           |
| Category-Section            | 5249:25159                                  |           |
| Create playlist             | 7384:55216                                  |           |
| Playlist continued          | 7598:27351                                  |           |
| Library                     | 7890:55400                                  |           |
| Ministers profile           | 7928:20594                                  |           |
| Button (component set)      | 7953:21955                                  | See below |

## Color styles (Figma)

-   **White**
-   **Primary/Green:** 50, 100, 200, 300, 400, **500 (P)** — primary CTA `#08ffdb`, 600–1000 for darker steps
-   **Grey:** 50–900; **600 (P)** used for borders/muted; 900 for background `#171717`
-   **Blue:** 50–800 (secondary palette)
-   **Warning/Red:** 50–900 (destructive / alerts)

Semantic mapping: use Primary/Green-500 for primary actions, Grey-900 for background, Grey-600 for borders, Grey-50 for card foreground / outline label.

## Text styles (Figma)

All **Matter** family. Weights: Light, Regular, Medium, SemiBold, Bold, Heavy; link variant "Link Underlined" (Light).

| Style group           | Sizes                  | Usage                         |
| --------------------- | ---------------------- | ----------------------------- |
| Display               | 96, 72, 52, 40         | SemiBold                      |
| Heading-1 … Heading-6 | 35, 32, 28, 24, 20, 18 | All weights                   |
| Body-1, Body-2        | 16, 14                 | All weights + Link Underlined |
| Caption               | 12                     | All weights + Link Underlined |

Splash uses body headline 20/24; button label 16/24 Matter SemiBold (see [figma-raw-audit.md](./figma-raw-audit.md)).

## Button component set (7953:21955)

| Variant             | Fill      | Text                 | Radius |
| ------------------- | --------- | -------------------- | ------ |
| Property 1=Default  | `#08ffdb` | `#292929` (Grey-600) | 6      |
| Property 1=Variant2 | none      | `#08ffdb`            | 6      |

Label: Matter Medium 14, letterSpacing 0.14, lineHeight 20. Aligns with canonical primary (filled) and outline (text-only) in code.
