# feat-0009: Homepage — product surfaces (Exact-style tabs)

## Summary

Add a **new** homepage section **`#why-troott`** on `apps/website` that explains Troott’s four product surfaces (App, Studio, Share, Churches). Layout follows the **Exact “Use cases”** reference: horizontal pill tabs, **one** active visual panel, detail footer (copy + CTA).

This is a **new section** in the homepage stack — not a modification of `CoreFeaturesSection`, `FeaturedPartnersSection`, or other existing blocks. [feat-0004](../feat-0004/PRODUCT.md) documents a separate Warp-style design reference; this spec is independent.

**Design reference:** `./assets/exact-use-cases-reference.png` — `// Use cases`, “One tool.” / “Every use case.”, horizontal pills, 16:10 visual, footer copy + white CTA.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Placement](#d1--section-placement), [Layout](#d2--single-column-layout), [Tabs](#d3--horizontal-pill-tabs), [Visual card](#d4--visual-card-pixel-spec), [Footer row](#d5--detail-footer-row), [Content](#d6--content-model).

**Recommendations:** [R1 Copy](#r1--copy), [R2 Motion](#r2--motion--reduced-motion), [R3 Accessibility](#r3--accessibility), [R4 Chrome](#r4--monochrome-chrome), [R5 Homepage stack](#r5--homepage-stack).

**Normative rule:**

> At `lg` (≥1024px), the section is a **single-column** stack: header → horizontal tab pills → one visual card → one detail footer. Only **one tab panel** is visible at a time. Tab change updates visual + footer in place (no stacked scroll sections, no left sidebar nav).

---

## Problem

| Today | Gap |
| ----- | --- |
| No Exact-style product-surfaces block on homepage | Marketing page lacks a tabbed “one tool, every use case” story for App / Studio / Share / Churches |
| Four Troott surfaces spread across other sections | Listeners and ministers need a single scannable product-family section |
| Navbar / scroll targets need `#why-troott` | Anchor for product story in homepage funnel |

**Goal:** Ship a **new** pixel-aligned product surfaces section at **1440px desktop width**, with Troott copy from `why-troott.ts` and Exact-style horizontal tabs.

**Calibration viewport:** 1440 × 900 CSS px, 1× DPR, dark mode. All `px` values in pixel tables are CSS pixels at this width unless noted.

---

## Design reference (Exact → Troott)

| Exact element | Troott v1 |
| ------------- | --------- |
| `// Use cases` | `// Why Troott` |
| `One tool. Every use case.` | `Listen with focus.` / `Share with confidence.` |
| Full-stack / Debug / API / Testing pills | Troott App / Studio / Share & grow / For churches |
| Landscape + code editor overlay | **Full-bleed product screenshot** per tab (no code overlay v1) |
| `Full-stack development` eyebrow | `tab.eyebrow` |
| Body paragraph | `tab.description` |
| `Start building` CTA | Tab-specific CTA (`GetTroottButton` or link) |

Reference image: `./assets/exact-use-cases-reference.png` (copy from session asset `Screenshot_2026-06-10_at_02.53.09`).

---

## Design reference (measurements @ 1440px viewport)

Reference artboard: **1440 × ~900px** visible section region. Values below are **normative** for QA at `lg` (1024px+) unless a range is given.

### Section shell

```text
┌─ viewport 1440px ─────────────────────────────────────────────────────────┐
│  site header (64px, --site-header-height)                                  │
├─ section py 112px ────────────────────────────────────────────────────────┤
│  ┌─ container max-w-1280px, mx-auto, px 24px ──────────────────────────┐ │
│  │  [header block]                                                       │ │
│  │  [tab pills row]                                                      │ │
│  │  [visual card 16:10]                                                  │ │
│  │  [detail footer row]                                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `why-troott` | `id="why-troott"` |
| Background | `#0A0A0A` (`--background` ≈ `hsl(0 0% 3.9%)`) | `bg-background` |
| Section padding Y | **80px** mobile → **112px** `sm+` | `py-20 sm:py-28` |
| Container max width | **1280px** | `max-w-7xl` |
| Container horizontal padding | **16px** `< md` → **24px** `md+` | `px-4 md:px-6` |
| Content width @ 1440 | **1232px** (1280 − 48 padding) | — |

### Header block

#### Eyebrow label

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy | `// Why Troott` | from `whyTroottContent.label` |
| Font | mono 13px | `font-mono text-[13px] leading-none` |
| Color | `#71717A` | `text-zinc-500` |
| Margin to H2 | **20px** | `mt-5` on `h2` |

#### Section heading (`h2`)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Line 1 | `Listen with focus.` | `text-white` block |
| Line 2 | `Share with confidence.` | `text-zinc-500` block |
| Font | Matter SemiBold | `font-semibold` |
| Size | **44px** → **48px** `sm` → **56px** `lg` | `text-[2.75rem] sm:text-5xl lg:text-[3.5rem]` |
| Line height | **1.05** | `leading-[1.05]` |
| Letter spacing | **−0.03em** | `tracking-[-0.03em]` |
| `id` | `why-troott-heading` | `aria-labelledby` target |
| Margin below | **32px** | `mb-8` on header wrapper |

#### Header spacing

| Gap | px |
| --- | -- |
| Label → heading | 20 |
| Heading → tab row | 32 |
| Tab row → visual card | 32 |

### Horizontal tab pills (segmented control)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Tablist track | shared pill bar | `inline-flex flex-wrap gap-1 rounded-full bg-[#262626] p-1.5` |
| Tab height | **36px** → **40px** `sm+` | `h-9 sm:h-10` |
| Tab padding X | **20px** | `px-5` |
| Tab radius | pill | `rounded-full` |
| Font | 14px Regular | `text-sm font-normal font-matter` |
| Gap inside track | **4px** | `gap-1` |

| State | Background | Text |
| ----- | ---------- | ---- |
| Track (wraps all tabs) | `#262626` | — |
| Active tab | `#ECECEC` | `#000000` |
| Inactive tab | transparent (on track) | `#FFFFFF` |
| Inactive hover | transparent | `white/90` |
| Focus visible | — | `ring-2 ring-white/40 ring-offset-2 ring-offset-[#262626]` |

**No icons** in pills. **Reject** vertical sidebar, scroll-spy stacked sections ([feat-0004](../feat-0004/PRODUCT.md) Warp pattern).

| `tab.id` | Pill label |
| -------- | ---------- |
| `listen` | Troott App |
| `studio` | Troott Studio |
| `share` | Share & grow |
| `churches` | For churches |

### Visual card

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Aspect ratio | **16 / 10** | `aspect-[16/10]` |
| Min height | **320px** `< sm` | `min-h-[320px]` |
| Border radius | **20px** | `rounded-[20px]` |
| Border | **none** | — |
| Overflow | hidden | `overflow-hidden` |
| Image | `fill object-cover` | Next `Image` |
| Margin below | **40px** | `mb-10` |
| `sizes` | `(max-width: 1024px) 100vw, 1232px` | — |

**Out of v1:** centered code-editor / mockup overlay (Exact reference only).

### Detail footer row

```text
┌─ footer row ───────────────────────────────────────────────────────────┐
│  [ eyebrow 14px ] + [ description white 16–18px ]  [ CTA h-40 right ]   │
└──────────────────────────────────────────────────────────────────────────┘
```

| Property | `≥ md` | `< md` |
| -------- | ------ | ------ |
| Layout | `flex-row items-end justify-between` | `flex-col` |
| Gap | **40px** | **24px** |
| CTA align | `self-end shrink-0` | `self-start` |

#### Panel eyebrow

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy | `tab.eyebrow` | sentence case |
| Size | **14px** | `text-sm leading-5` |
| Color | `#71717A` | `text-zinc-500` |
| Margin below | **12px** | `mb-3` |
| Icon | **none** | — |

#### Description

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy | `tab.description` | e.g. listen tab body copy |
| Font | Matter Regular | `font-matter` |
| Size | **16px** → **18px** `sm+` | `text-base sm:text-lg` |
| Line height | **1.6** / **1.65** | `leading-[1.6] sm:leading-[1.65]` |
| Color | `#FFFFFF` | `text-white` |
| Max width | **672px** | `max-w-2xl` |
| Live region | tab change | `aria-live="polite"` |

#### CTA button

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Height | **40px** | `h-10` |
| Padding | **24px × 10px** | `px-6 py-2.5` |
| Radius | **6px** | `rounded-sm` |
| Background / text | white / black | `bg-white text-black hover:bg-white/90` |
| Font | 14px Regular | `text-sm font-normal` |

### Typography scale (Matter @ lg)

| Role | Class | Size |
| ---- | ----- | ---- |
| Eyebrow `//` | `font-mono` | 13px |
| H2 | `font-matter-semibold` | 56px |
| Tab pill | `font-matter` | 14px |
| Panel eyebrow / description / CTA | `font-matter` | 14–16px |

### Color tokens

| Token | Hex | Usage |
| ----- | --- | ----- |
| Section bg | `#0A0A0A` | `bg-background` |
| Text primary | `#FAFAFA` | H2 line 1 |
| Text muted | `#71717A` | H2 line 2, eyebrows |
| Text body | `#A1A1AA` | Description |
| Tab track | `#262626` | Shared pill bar |
| Tab active | `#ECECEC` / `#000000` | Elevated pill on track |
| Tab idle | transparent / `#FFFFFF` | Label on track |
| CTA | `#FFFFFF` / `#000000` | Button |

Troott teal (`#08FFDB`) is **not** used in this section.

### Measurement checklist (QA @ 1440px)

Tolerance **±2px**.

| # | Measurement | Expected |
| - | ----------- | -------- |
| 1 | Section padding top | 112px |
| 2 | Container content width | 1232px |
| 3 | Eyebrow font size | 13px |
| 4 | Label → H2 gap | 20px |
| 5 | H2 font size | 56px |
| 6 | H2 line-height | 58.8px |
| 7 | H2 → tabs gap | 32px |
| 8 | Tab height | 40px |
| 9 | Tab padding X | 20px |
| 10 | Tab gap | 8px |
| 11 | Tabs → card gap | 32px |
| 12 | Card border radius | 20px |
| 13 | Card aspect | 16:10 (1232 → 770px height) |
| 14 | Card → footer gap | 40px |
| 15 | Description max-width | 448px |
| 16 | CTA height | 40px |
| 17 | CTA radius | 6px |
| 18 | Footer row gap (desktop) | 40px |

**Visual regression:** header : card : footer ≈ **22% : 58% : 20%** of section content height.

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Add **`WhyTroottSection`** as a **new** homepage section; wire once in [`page.tsx`](../../../apps/website/app/page.tsx). |
| **Anchor** | `id="why-troott"`. |
| **Order** | After `FeaturedPartnersSection`, before `BenefitsSection` ([feat-0008](../feat-0008/PRODUCT.md)) — see [README homepage stack](../../README.md#new-homepage-sections-feat-0007--feat-0009). |
| **Not in v1** | Standalone `/products` route. |

### D2 — Single-column layout

| | Detail |
| --- | ------ |
| **Decision** | One vertical stack at **all** breakpoints — no `lg` sidebar column. |
| **Reject** | Warp left-rail + right panel ([feat-0004](../feat-0004/PRODUCT.md)). |
| **Reject** | Stacked scroll-spy sections (all tabs visible while scrolling). |

### D3 — Horizontal pill tabs

| | Detail |
| --- | ------ |
| **Decision** | Click (or keyboard) switches **one** active panel; `activeTabId` in React state. |
| **Default tab** | `listen` (`defaultTabId`). |
| **Mobile** | `flex-wrap` on pills; **no** sidebar fallback. |
| **Not in v1** | URL hash sync (`#why-troott-listen`). |

### D4 — Visual card

| | Detail |
| --- | ------ |
| **Decision** | Full-bleed `next/image` per tab; **16:10**, **20px** radius, **no** border. |
| **Motion** | 200ms opacity crossfade on tab change unless `prefers-reduced-motion`. |
| **Not in v1** | Floating mockup / code overlay. |

### D5 — Detail footer row

| | Detail |
| --- | ------ |
| **Decision** | Eyebrow + description left; CTA right (`md+`); no large per-tab `h3`. |
| **CTAs** | `GetTroottButton` for `listen`; links per `why-troott.ts` for other tabs. |

### D6 — Content model

| | Detail |
| --- | ------ |
| **Decision** | Single source: [`why-troott.ts`](../../../apps/website/_data/troott/why-troott.ts) — four tabs, images, CTAs. |
| **Schema** | Keep existing `WhyTroottTab` / `WhyTroottContent` types. |

---

## Recommendations

### R1 — Copy

| Field | Value |
| ----- | ----- |
| `label` | `// Why Troott` |
| `heading` | `Listen with focus.` |
| `headingMuted` | `Share with confidence.` |

Per-tab content:

| Tab | Eyebrow | CTA |
| --- | ------- | --- |
| `listen` | Troott App | Get the app (`useGetTroott: true`) |
| `studio` | Troott Studio | Open Studio (external) |
| `share` | Share & grow | Start listening → `#listener` |
| `churches` | For churches | For ministers → `#minister` |

Full strings in `why-troott.ts`.

### R2 — Motion / reduced motion

| Effect | Behavior |
| ------ | -------- |
| Tab image swap | 200ms opacity fade |
| `prefers-reduced-motion` | Instant swap, no fade |

### R3 — Accessibility

| Requirement | Implementation |
| ----------- | -------------- |
| Section | `aria-labelledby="why-troott-heading"` |
| Tabs | `role="tablist"` / `role="tab"` / `aria-selected` |
| Panel | `role="tabpanel"` `id="why-troott-panel"` |
| Keyboard | Arrow L/R between tabs; Enter/Space activates |
| Live region | `aria-live="polite"` on description on tab change |

### R4 — Monochrome chrome

No teal accent, no tab icons — `#262626` segmented track with `#ececec` active pill per Exact reference.

### R5 — Homepage stack

See [README — new homepage sections](../../README.md#new-homepage-sections-feat-0007--feat-0009). This feat adds **`WhyTroottSection`** only.

---

## Acceptance criteria

### Visual / UX (@ 1440px, `lg+`)

- [ ] Layout matches [measurement checklist](#measurement-checklist-qa--1440px) within ±2px.
- [ ] Segmented tab track `#262626`; active pill `#ECECEC`/`#000000`; inactive white on track.
- [ ] Footer description `text-white` at 16–18px (`max-w-2xl`).
- [ ] Single visual card + single footer; tab click swaps content in < 200ms.
- [ ] No left sidebar at any breakpoint.
- [ ] Visual card: 16:10, `rounded-[20px]`, no border.

### Content / CTAs

- [ ] Four tabs from `why-troott.ts`.
- [ ] `listen` tab: `GetTroottButton` opens listener `Newsletter` modal on fallback.
- [ ] Images use `tab.image.alt`; no layout shift (aspect-ratio reserved).

### Accessibility

- [ ] Keyboard-navigable tablist per [R3](#r3--accessibility).
- [ ] `prefers-reduced-motion`: no opacity animation on tab swap.

### Build

- [ ] `pnpm --filter @troott/website build` passes.

---

## Out of scope (v1)

- Code-editor overlay inside visual card
- Auto-rotating tabs / carousel timer
- Sticky horizontal tabs on scroll
- URL hash tab deep links
- Light theme

---

## References

- Reference screenshot: `./assets/exact-use-cases-reference.png`
- Content: [`why-troott.ts`](../../../apps/website/_data/troott/why-troott.ts)
- Warp alternate design: [feat-0004 PRODUCT](../feat-0004/PRODUCT.md)
- CTA pattern: [feat-0003 PRODUCT](../feat-0003/PRODUCT.md) (`GetTroottButton`)
