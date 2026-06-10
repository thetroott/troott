# feat-0014 reference assets

Design reference for **Legal** routes on `apps/website`.

| File | Description |
| ---- | ----------- |
| `legal-audience-chooser-reference.png` | Page 1: Minister vs Listener choice (optional mock — spec is normative) |
| `legal-minister-hub-reference.png` | `/legal/minister` hub — optional; mirrors listener hub layout |
| `legal-minister-document-reference.png` | e.g. `/legal/minister/privacy-policy` scrollspy — optional |

## Content drafting

Legal body copy is **not** stored here. Author in `apps/website/_data/legal/` using the monorepo source inventory in [PRODUCT D7](../PRODUCT.md#d7--content-sources-from-monorepo-apps).

Before drafting, review:

- `apps/api/src/models/` (user, listener, minister, playback-session)
- `apps/mobile/docs/google-play-store-listing.md`
- `apps/web/src/api/services/cookies.ts`
- `apps/website/app/siteConfig.tsx` (current broken links to replace)
| `legal-scrollspy-layout-reference.png` | Copy of Why Troott scrollspy @ 1440px — reuse [feat-0004](../feat-0004/assets/warp-why-terminal.png) layout semantics |

**Implementation reference (code):**

- [`WhyTroottSection.tsx`](../../../../apps/website/components/containers/why-troott/WhyTroottSection.tsx)
- [`useWhyTroottScrollspy.ts`](../../../../apps/website/components/containers/why-troott/useWhyTroottScrollspy.ts)

Legal pages **must match** this layout’s grid, sticky nav, scrollspy behavior, and nav row chrome — with legal prose instead of product panels.
