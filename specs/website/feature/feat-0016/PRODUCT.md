# feat-0016: Minister page — full content spec

## Summary

Normative **content and positioning** for **`/minister`** — Troott’s landing page for ministers, preachers, and teachers.

The page must speak to **publish, protect, and disciple** jobs — not listener jobs (discover, listen, share). All copy uses **simple conversational English** and is grounded in [`content.txt`](../../../../apps/website/_data/content.txt).

**Full section-by-section copy:** [MINISTER_PAGE_CONTENT.md](./MINISTER_PAGE_CONTENT.md)

**App:** `apps/website`  
**Route:** `/minister` → `app/minister/page.tsx`

---

## Problem

| Today | Gap |
| ----- | --- |
| Minister page reuses **homepage sections** with listener-first copy | Ministers see “Listen anywhere”, listener FAQs, and `listen` as the default tab |
| Value props on `/minister` were easy to confuse with **listener cards** (Discover, Listen anywhere, Share easily) | Wrong JTBD — ministers need protect / publish / reach outcomes |
| Hero and body copy not tied to **`content.txt`** pains (piracy, uncredited sharing, no distribution) | Weak positioning vs real minister aha moments |

**Goal:** One coherent minister landing where every section answers minister JTBD and names outcomes they care about.

---

## Scope

### In scope

- Hero (`HeroSection` + `ministerHeroContent`)
- Value props grid (3 minister outcome cards)
- Why Troott tabs (Studio default, minister copy)
- Benefits grid (minister variant)
- Product workflows (Studio default, minister copy)
- FAQ (minister subset)
- Cross-link to `/listener`

### Out of scope (follow-ups)

- Hide `DownloadsSection` on `/minister` ([feat-0015 R1](../feat-0015/PRODUCT.md))
- Minister-specific analytics events
- Pricing / plans page

---

## Key decisions

| ID | Decision |
| -- | -------- |
| D1 | **No listener value props** on `/minister` — use Protect / Upload once / Reach cards ([MINISTER_PAGE_CONTENT §2](./MINISTER_PAGE_CONTENT.md#section-2--value-props-3-cards)) |
| D2 | Hero CTAs: **Upload sermons** (primary) + **Request demo** or **Contact Sales** (secondary) — same two-button layout as home |
| D3 | Default tab on minister page sections: **`studio`**, not `listen` |
| D4 | Shared section components take **audience-specific content props**; homepage keeps current defaults |
| D5 | Voice: everyday English, name real pains (piracy, WhatsApp forwards, buried content) |

---

## Acceptance criteria

See [MINISTER_PAGE_CONTENT.md — Acceptance criteria](./MINISTER_PAGE_CONTENT.md#acceptance-criteria).

---

## Related

- [MINISTER_PAGE_CONTENT.md](./MINISTER_PAGE_CONTENT.md) — normative copy
- [feat-0015](../feat-0015/PRODUCT.md) — audience landing routes
- [`audience-landing.ts`](../../../../apps/website/_data/troott/audience-landing.ts) — hero + value props data
