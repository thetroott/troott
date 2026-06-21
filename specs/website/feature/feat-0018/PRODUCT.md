# feat-0018: Homepage — content edit spec

## Summary

Normative **content and positioning** for **`/`** — Troott’s main marketing homepage.

Copy is grounded in [`content.txt`](../../../../apps/website/_data/content.txt) (product PRD, JTBD, waitlist/email language, landing-page requirements). Implementation lives in **`apps/website/_data/troott/*.ts`** — `content.txt` is **not** loaded at runtime.

**Full section-by-section copy:** [HOMEPAGE_CONTENT.md](./HOMEPAGE_CONTENT.md)

**App:** `apps/website`  
**Route:** `/` → `app/page.tsx`

---

## Problem

| Today | Gap |
| ----- | --- |
| Homepage copy is split across many `_data` files with no single edit guide | Content editors must hunt TS exports to know what to change |
| `content.txt` holds rich PRD/marketing language but is disconnected from the live page | Risk of drift between source doc and shipped copy |
| Third `FeatureHighlightSection` on `/` duplicates the first block | Weak narrative; wastes a slot that should carry a third message |
| `WhyTroottSection` and `SectionIntroSection` repeat the same headline pair | Redundant intro before feature highlights |

**Goal:** One content spec that maps every homepage block → data file → field, with approved copy sourced from `content.txt`.

---

## Scope

### In scope

- Hero (`homeHeroContent`)
- Why Troott scrollspy (`whyTroottContent` — shared with tabs/workflows)
- Section intro bridge (`whyTroottIntroContent`)
- Feature highlight trio (listener app, Studio, third listener story)
- Why Troott tabs (`WhyTroottTabsSection`)
- Voice, tone, and `content.txt` source index

### Out of scope (follow-ups)

- Enabling sections commented out in `page.tsx` (Benefits, FAQs, App showcase, etc.) — see target stack in [`specs/website/README.md`](../../README.md)
- Wiring `content.txt` into the build (CMS / markdown pipeline)
- `/listener` and `/minister` — see [feat-0015](../feat-0015/PRODUCT.md) and [feat-0016](../feat-0016/MINISTER_PAGE_CONTENT.md)

---

## How to edit homepage copy

1. Open [HOMEPAGE_CONTENT.md](./HOMEPAGE_CONTENT.md) and find the section you need.
2. Edit the listed **data file** and **export** (TypeScript only — no JSX).
3. Run the website locally and check `/`.
4. Do **not** edit `content.txt` expecting the site to update — update `_data/troott/*.ts` and optionally sync `content.txt` later for documentation.

---

## Acceptance

- [ ] Every active block on `/` has a row in `HOMEPAGE_CONTENT.md` with file + export + fields.
- [ ] Hero and feature highlights reflect `content.txt` JTBD and landing-page UVP (ads-free, mobile-first, find/listen/share).
- [ ] Third feature highlight is **unique** (not a duplicate of block 1).
- [ ] Minister path is present but secondary (Studio block + minister CTA in hero secondary).
