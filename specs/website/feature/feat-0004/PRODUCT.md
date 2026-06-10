# feat-0004: Homepage — “Why Troott” tabbed product showcase

## Summary

Replace the stacked **Core features** cards on the marketing homepage with a **Warp-style tabbed showcase**: section header, **vertical tab list** (desktop), and a **detail panel** (title, body, CTA, large product visual) that updates when the user selects a tab.

**Design reference:** [Warp “Why Warp” section](https://www.warp.dev/) — eyebrow label, two-line headline, left rail with icon + label per product surface, right panel with sub-label, H3, paragraph, primary button, and full-width UI screenshot (see reference screenshots in `./assets/`).

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md). Builds after hero; may **replace** current `CoreFeaturesSection` stack on [`app/page.tsx`](../../../apps/website/app/page.tsx).

**Normative decisions:** [Section placement](#d1--section-placement), [Tab model](#d2--tab-content-model-v1), [Click / keyboard](#d3--click-keyboard--mobile), [Scroll-driven desktop](#d4--scroll-driven-interaction-desktop-lg), [Visual fidelity](#d5--visual-fidelity-vs-warp-reference).

**Recommendations (implement unless product overrides):** [R1 Copy](#r1--copy--content-migration), [R2 Typography](#r2--typography--eyebrow), [R3 Visual chrome](#r3--visual-chrome), [R4 Sticky + navbar](#r4--sticky-pin--navbar-offset), [R5 Mobile](#r5--mobile-accordion), [R6 CTAs & links](#r6--ctas--external-links), [R7 Anchor & SEO](#r7--section-anchor--seo), [R8 Cleanup](#r8--legacy-cleanup).

---

## Problem

| Today | Gap |
| ----- | --- |
| Three full-width **stacked** cards (`FeatureShowcaseCard`) | Long scroll; no single “product family” story |
| Each card alternates image left/right | Good for SEO depth, weak for comparing **listener vs studio vs church** surfaces |
| No in-section navigation | Warp pattern lets users explore multiple products without leaving the fold |
| Click-only tabs (current spec draft) | Misses Warp’s **scroll-driven** showcase — sticky section where scrolling advances tabs |

**Goal:** One cohesive **“Why Troott”** block that explains the platform surfaces the way Warp explains Terminal / Oz / Agent / Team — including **scroll-linked tab progression** on desktop, not just click-to-switch.

---

## Design reference (Warp → Troott mapping)

| Warp reference (screenshot) | Troott v1 tab |
| --------------------------- | ------------- |
| Eyebrow: “WHY WARP” | `WHY TROOTT` (or `// Why Troott` to match existing mono label style) |
| Headline: “Be more productive. Stay in control.” | **Listener + creator headline** (see copy below) |
| Tab: WARP TERMINAL | **Troott App** — listen on mobile & web |
| Tab: OZ AGENT PLATFORM | **Troott Studio** — upload & manage sermons |
| Tab: WARP AGENT | **Share & grow** — share teachings, playlists, reach |
| Tab: SCALE ACROSS YOUR TEAM | **For churches** — ministers, teams, congregation |

Reference images (internal):

- `./assets/warp-why-terminal.png` — tab + terminal screenshot layout
- `./assets/warp-why-oz.png` — tab + dashboard screenshot layout

Copy and screenshots use **Troott** product visuals (existing `/public/images/*` until dedicated UI captures land).

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Insert **one** `WhyTroottSection` on the homepage **immediately after** `HeroSection`, **replacing** the current `CoreFeaturesSection` usage (remove stacked three-card block from v1 homepage). |
| **Why** | Hero introduces brand; this section explains **product surfaces** before bento/FAQ depth. |
| **Not in v1** | Second instance on `/ministers` or `/listeners` landing routes — follow-up feat if needed. |

### D2 — Tab content model (v1)

Four tabs, fixed order:

| `id` | Nav label | Panel title | CTA (normative) |
| ---- | --------- | ----------- | ---------------- |
| `listen` | Troott App | Start in the app | **Get the app** → [feat-0003 get-troott](../feat-0003/PRODUCT.md) or `#listener` |
| `studio` | Troott Studio | Publish from Studio | **Open Studio** → `siteConfig.baseLinks.studio` |
| `share` | Share & grow | Spread the Word | **Start listening** → `siteConfig.baseLinks.listeners` |
| `churches` | For churches | Scale across your church | **For ministers** → `siteConfig.baseLinks.ministers` |

Each tab includes:

- **Nav:** Remix icon (or Lucide), label, optional short description (desktop nav only — Warp shows label only in rail).
- **Panel:** sub-label (matches nav), **H3**, 2–3 sentence description, **one** primary white button, **one** product image (`next/image`, dark-framed screenshot).

Content lives in **`_data/troott/why-troott.ts`** — not hardcoded in JSX.

**Default tab:** `listen` (first tab selected on load).

### D3 — Click, keyboard & mobile

| Surface | Behavior |
| ------- | -------- |
| **Tab click (desktop)** | Clicking a left-rail item **activates** that tab **and scrolls** the page to that tab’s scroll step (see [D4](#d4--scroll-driven-interaction-desktop-lg)). |
| **Keyboard** | Tab list is a **tablist** (`role="tablist"` / `role="tab"` / `role="tabpanel"`); arrow keys move selection; `Enter`/`Space` activates + scrolls to step. |
| **`< lg`** | Stacked sections only — no accordion, no sticky nav; continuous scroll through all four blocks. |
| **Motion** | Panel text + image **crossfade** (~200ms) on tab change; respect `prefers-reduced-motion`. |
| **URL** | No deep-link query in v1 (`?tab=studio` optional P2). |

### D4 — Scroll-driven interaction (desktop `lg+`)

On large viewports the section uses **scroll-synchronized navigation** (scrollspy / sticky table of contents) — the same reading pattern as long-form docs, privacy policies, and blog posts.

| | Detail |
| --- | ------ |
| **Pattern name** | Scrollspy navigation · sticky table of contents · scroll-synced navigation |
| **User experience** | A **sticky navigation panel** stays visible on the left while the user scrolls through the page. Each nav item maps to a **content section** on the right. As a section enters the viewport, the matching nav item becomes **active**. Clicking a nav item **smooth-scrolls** to that section. All four product stories remain **visible in document flow** (stacked sections), not swapped in a single panel slot. |
| **Scroll height** | **Natural document height** — sum of stacked section blocks (`gap-24` / `gap-32` between sections). **No** artificial `tabs.length × 100vh` scroll track. |
| **Active tab source of truth** | `IntersectionObserver` on section nodes drives `activeTabId`; nav click **also** sets active state and scrolls to the section (bidirectional sync). |
| **Left rail** | `position: sticky` below site header; active item updates as sections cross the observer threshold (white label + left accent bar + `aria-current="true"`). |
| **Right column** | **Four stacked `<section>` blocks** — each with eyebrow, title, description + CTA row, and screenshot. Reader scrolls through content; nav reflects position. |
| **Reverse scroll** | Scrolling **up** activates the previous section when it re-enters the observer zone (symmetric behavior). |
| **Reduced motion** | When `prefers-reduced-motion: reduce`: keep scrollspy + stacked layout; use **instant** scroll on nav click (`behavior: 'auto'`). IO active-state updates remain enabled. |
| **Not in v1** | Horizontal scroll chips; auto-rotate timer; full-page pin / scrollytelling with single swapping panel. |

**Product copy (for design / eng briefs):**

> The page uses a scroll-synchronized table of contents. The navigation remains fixed on the left side while the content scrolls independently. As the reader progresses through each section, the active state automatically updates to highlight the current section, making it easy to understand where they are in the document and quickly navigate between topics.

**UX benefits:**

- Improves orientation in long documents
- Reduces excessive scrolling to re-read a prior topic (click to jump)
- Provides clear reading progress via active nav state
- Makes navigation feel responsive to scroll and click
- Encourages exploration of all product surfaces

```text
Desktop layout (scrollspy):

┌─ sticky nav ─┐  ┌─ section: listen ─────────────────┐
│ ● Troott App │  │  copy + CTA + image               │
│   Studio     │  └───────────────────────────────────┘
│   Share      │  ┌─ section: studio ─────────────────┐
│   Churches   │  │  copy + CTA + image               │
└──────────────┘  └───────────────────────────────────┘
                  … (share, churches) …
```

### D5 — Visual fidelity vs Warp reference

| Element | Warp | Troott v1 |
| ------- | ---- | --------- |
| Background | Pure black | `bg-background` / `#0a0a0a` — match feat-0001 shell |
| Section padding | Generous vertical | `py-20 sm:py-28` (align with current `CoreFeaturesSection`) |
| Active tab | White text + left accent bar | White label + **2px left border** or subtle `bg-white/5` row highlight |
| Inactive tab | Muted gray + icon | `text-zinc-500`, hover `text-zinc-300` |
| Panel eyebrow | Small caps + icon | Mono or small caps + tab icon |
| CTA | White pill button | Reuse feat-0002 / showcase card button styles |
| Screenshot | Large, rounded, drop shadow | `rounded-2xl` / `rounded-3xl`, `border border-white/10`, optional soft shadow |

**Out of scope v1:** Video loops, live embeds, auto-rotating carousel without user focus.

---

## Recommendations (binding unless overridden)

These close gaps from the first spec draft. Treat as **default implementation**; change only with explicit product sign-off.

### R1 — Copy & content migration

Migrate from [`core-features.ts`](../../../apps/website/_data/troott/core-features.ts) where possible. **Section header** stays aligned with today’s core features block:

| Field | Recommended copy |
| ----- | ---------------- |
| `label` | `// Why Troott` (mono — matches homepage section labels) |
| `heading` | `Listen with focus.` |
| `headingMuted` | `Share with confidence.` |

**Per-tab copy (v1):**

| `id` | `navLabel` | `eyebrow` | `title` | `description` | `cta.label` | `cta` target |
| ---- | ---------- | --------- | ------- | --------------- | ----------- | ------------ |
| `listen` | Troott App | Troott App | Your sermon library, organized | Every message you love in one place. Find ministers, pick up where you left off, and listen without ads or clutter. | Get the app | `<GetTroottButton />` ([feat-0003](../feat-0003/PRODUCT.md)); fallback: `siteConfig.baseLinks.getTroott` |
| `studio` | Troott Studio | Troott Studio | Upload and reach listeners | Ministers publish sermons from Troott Studio. Upload audio, manage your library, and help more people stay rooted in God’s Word. | Open Studio | `siteConfig.baseLinks.studio` |
| `share` | Share & grow | Share & grow | Share teachings in one tap | Send a sermon to a friend, your small group, or family. Troott makes it easy to pass on what helped you grow. | Start listening | `siteConfig.baseLinks.listeners` |
| `churches` | For churches | For churches | Scale across your church | Give every minister a home for their messages and every listener one app to grow together. Troott keeps your church library organized and easy to share. | For ministers | `siteConfig.baseLinks.ministers` |

**Icons (Remix, match navbar dependency):**

| Tab | Icon |
| --- | ---- |
| `listen` | `RiHeadphoneLine` |
| `studio` | `RiUploadCloud2Line` |
| `share` | `RiShareForwardLine` |
| `churches` | `RiBuildingLine` |

**Images:** reuse mapping from [TECH v1 image table](./TECH.md#data-model); replace with Figma exports in a follow-up — not a blocker for v1.

### R2 — Typography & eyebrow

Match existing [`CoreFeaturesSection`](../../../apps/website/components/containers/feature-showcase/CoreFeaturesSection.tsx) scale — do not invent new type ramp:

| Element | Classes (normative) |
| ------- | ------------------- |
| Section label | `font-mono text-[13px] leading-none text-zinc-500` |
| Section H2 | `text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]`; line 2 `text-zinc-500` |
| Panel eyebrow | `font-mono text-[11px] uppercase tracking-wider text-zinc-500` + 16px icon |
| Panel H3 | `text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[1.875rem]` |
| Panel body | `text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7] max-w-[28rem]` |

### R3 — Visual chrome

| Element | Recommendation |
| ------- | -------------- |
| **Active tab (desktop)** | **Left accent bar only** — `border-l-2 border-white text-white pl-4`. No full-row gray fill (simpler, closer to Warp Terminal ref). |
| **Inactive tab** | `border-l-2 border-transparent text-zinc-500 pl-4`; hover `text-zinc-300`. |
| **CTA placement** | **Below** description (Warp Terminal pattern) on all tabs — not inline right. |
| **CTA style** | Reuse `FeatureShowcaseCard` white pill: `rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black`. Listen tab: swap inner control for `GetTroottButton` with same visual weight. |
| **Screenshot frame** | **No** fake macOS window chrome in v1 — rounded image + `border border-white/10` only. Add chrome in a polish pass if design exports it. |
| **Progress indicator** | **None** — scroll position + active tab is sufficient (Warp does not show step dots). |
| **Container** | `container mx-auto max-w-7xl px-4 md:px-6` — same as core features. |
| **Section header** | Label + H2 above the scrollspy grid (full width). |

### R4 — Sticky nav & navbar offset

feat-0002 navbar is `sticky top-0 z-50`. The scrollspy **nav rail** must sit **below** the header when sticky, and section anchors must land below the header.

| | Recommendation |
| --- | -------------- |
| **CSS variable** | Define `--site-header-height: 4rem` on `html` or section root (navbar `py-3` + logo ≈ 64px). |
| **Sticky nav top** | Left nav: `sticky top-[calc(var(--site-header-height)+1.5rem)] self-start`. |
| **Section scroll margin** | Each content section: `scroll-mt-[calc(var(--site-header-height)+1.5rem)]` so anchor jumps clear the navbar. |
| **Click scroll** | `scrollIntoView({ block: 'start' })` on `#why-troott-{tabId}`; offset handled by `scroll-mt`. |
| **z-index** | Section content default stacking; navbar stays `z-50`. |

### R5 — Mobile layout

| | Recommendation |
| --- | -------------- |
| **Layout** | **Same stacked sections as desktop** — normal document flow; no accordion, no sticky nav. |
| **Nav** | Sticky scrollspy nav is **desktop only** (`lg+`); hidden on `< lg`. |
| **Spacing** | `gap-16 sm:gap-20` between sections on mobile; `gap-24 xl:gap-32` on desktop content column. |
| **Panel content** | Each section: eyebrow, title, body + CTA row, image — identical markup at all breakpoints. |
| **Section header** | Label + H2 above the grid (full width). |

### R6 — CTAs & external links

| CTA | Recommendation |
| --- | -------------- |
| **Listen** | `GetTroottButton` when feat-0003 is merged; else `<Link href={siteConfig.baseLinks.getTroott}>` with label “Get the app”. |
| **Studio** | External: `target="_blank"` `rel="noopener noreferrer"` (leaves marketing site). |
| **Listeners / ministers** | Same-tab navigation on `troott.com` routes (`siteConfig.baseLinks.*`). |
| **Analytics** | Optional P2: `@vercel/analytics` custom event `why_troott_tab_view` with `{ tab: id }` on tab change — not required for v1 ship. |

### R7 — Section anchor & SEO

| | Recommendation |
| --- | -------------- |
| **Section `id`** | Outer `<section id="why-troott">`; each tab block `id="why-troott-{tabId}"` for anchor nav. |
| **Heading structure** | One section **H2** (header); each tab block exposes one **H3** — all four visible in DOM on desktop (stacked sections). |
| **SEO** | Four H3s acceptable vs old three-card layout; each describes a distinct product surface. |

### R8 — Legacy cleanup

| | Recommendation |
| --- | -------------- |
| **Homepage** | Remove `CoreFeaturesSection` + `coreFeaturesContent` import from `page.tsx`. |
| **`core-features.ts`** | **Delete** after `why-troott.ts` lands if nothing else imports it. |
| **`FeatureShowcaseCard`** | **Keep** module exported — usable on `/ministers` or landing pages later; no delete in v1. |

---

## User stories

1. As a **visitor**, I scroll through “Why Troott” and the **left nav highlights the section I’m reading** — scroll-synchronized table of contents.
2. As a **visitor**, I can **click** a nav item to jump to that product story without hunting through stacked cards.
3. As a **listener**, I land on **Troott App** and get a clear path to download / listen.
4. As a **minister**, I reach **Troott Studio** via scroll or click and open Studio flows.
5. As a **keyboard / reduced-motion user**, I can use nav links without jarring smooth scroll (`prefers-reduced-motion`).

---

## Acceptance criteria

### Visual / UX

- [ ] Section matches **scrollspy structure**: header block + sticky left nav + stacked content sections on desktop (`lg+`).
- [ ] **Scroll-synced nav (desktop `lg+`):** sticky nav; scrolling updates active nav item as sections enter view ([D4](#d4--scroll-driven-interaction-desktop-lg)).
- [ ] **Bidirectional sync:** click nav item scrolls to section; scrolling updates active nav highlight.
- [ ] Four sections visible in document flow; each has title, description, CTA href, and image.
- [ ] Active nav item is visually distinct; inactive items remain readable on dark background.
- [ ] Sticky nav and anchor jumps respect navbar offset ([R4](./PRODUCT.md#r4--sticky-nav--navbar-offset)).
- [ ] Mobile uses stacked flowing sections per [R5](./PRODUCT.md#r5--mobile-layout) — no accordion.
- [ ] Section `id="why-troott"` ([R7](./PRODUCT.md#r7--section-anchor--seo)).
- [ ] Dark-only — no light-theme branches ([feat-0001](../feat-0001/PRODUCT.md)).

### Content / links

- [ ] All copy matches [R1](./PRODUCT.md#r1--copy--content-migration) (or approved overrides in `_data`).
- [ ] CTAs per [R6](./PRODUCT.md#r6--ctas--external-links); listen tab uses `GetTroottButton` when available.
- [ ] Images have meaningful `alt` text per tab.

### Accessibility

- [ ] Nav pattern passes axe / keyboard walkthrough (`<nav>` + anchor links, `aria-current`).
- [ ] Focus visible on tab controls and CTA.
- [ ] Reduced motion disables scroll-driven auto-advance **and** non-essential crossfades ([D4](#d4--scroll-driven-interaction-desktop-lg)).

### Integration

- [ ] Homepage uses `WhyTroottSection` instead of stacked `CoreFeaturesSection` (or `CoreFeaturesSection` internally delegates to new component — TECH choice).
- [ ] No regression to hero, navbar ([feat-0002](../feat-0002/PRODUCT.md)), or get-troott ([feat-0003](../feat-0003/PRODUCT.md)).

### Quality

- [ ] `pnpm --filter @troott/website build` passes.
- [ ] Lighthouse: no layout shift from image swap (reserve aspect ratio / fixed min-height for media slot).

---

## Non-goals (v1)

- CMS / MDX-driven tab content.
- Auto-advance / marketing carousel timer (scroll-driven only — user controls pace).
- Scroll-jacking on **mobile** (`< lg`).
- Replacing bento (`UserSection`), Mission, or FAQ blocks.
- Studio or mobile **live** iframes in the panel.

---

## Dependencies

| Spec | Relationship |
| ---- | -------------- |
| feat-0001 | Dark-only tokens and backgrounds |
| feat-0002 | Button / link styling consistency |
| feat-0003 | “Get the app” CTA may reuse `GetTroottButton` on listen tab |

---

## Open questions (only if recommendations rejected)

1. **IO rootMargin tuning** — adjust observer band if active nav feels early/late during QA.
2. **Screenshot window chrome** — deferred per [R3](./PRODUCT.md#r3--visual-chrome); add when Figma assets exist.
3. **Vercel analytics events** — optional P2 per [R6](./PRODUCT.md#r6--ctas--external-links).

---

## References

- Warp marketing: [warp.dev](https://www.warp.dev/) — “Why Warp” section
- Current implementation: [`CoreFeaturesSection`](../../../apps/website/components/containers/feature-showcase/CoreFeaturesSection.tsx), [`core-features.ts`](../../../apps/website/_data/troott/core-features.ts)
- Homepage: [`app/page.tsx`](../../../apps/website/app/page.tsx)
