# feat-0007: Homepage — FAQ two-column accordion

## Summary

Add a **new** homepage FAQ section (`#faqs`): mono eyebrow, two-line headline in the **left column** (sticky on desktop), and **stacked accordion cards** in the **right column** (Warp reference layout).

This is a **new section** in the homepage stack — not a modification of `CoreFeaturesSection`, `Mission`, or other existing blocks.

**Design reference:** `./assets/faq-two-column-reference.png` — `// FAQ`, “Questions?” / “We've got answers.”, dark rounded cards with `+` / `×` toggle.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md). Reuses homepage section tokens from [feat-0004](../feat-0004/PRODUCT.md) (container, eyebrow, split headline).

**Normative decisions:** [Placement](#d1--section-placement), [Layout](#d2--layout-desktop-lg), [Accordion](#d3--accordion-behavior), [Typography & color](#d4--typography--color-pixel-spec), [Mobile](#d5--mobile--lg), [Content](#d6--content-model).

**Recommendations:** [R1 Copy](#r1--copy), [R2 Sticky header](#r2--sticky-left-header), [R3 Card chrome](#r3--accordion-card-chrome), [R4 A11y](#r4--accessibility), [R5 Homepage stack](#r5--homepage-stack).

---

## Problem

| Today | Gap |
| ----- | --- |
| No dedicated Warp-style FAQ section on homepage | Marketing page lacks a two-column FAQ block with sticky header |
| Navbar `#faqs` target needs a first-class section | Anchor should land on this new section |
| FAQ content not in `_data` | Copy should live in `apps/website/_data/troott/faqs.ts` |

**Goal:** Ship a **new** pixel-aligned FAQ section at **1440px desktop width**, with Troott questions/answers and `id="faqs"` for navbar deep links.

---

## Design reference (measurements @ 1440px viewport)

Reference artboard: **1440 × ~900px** visible FAQ region (black shell). All values below are **normative** for implementation QA at `lg` (1024px+) unless a range is given.

### Section shell

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `faqs` | `id="faqs"` |
| Background | `#0a0a0a` (marketing shell) | `bg-background` |
| Section padding top / bottom | **96px** mobile → **128px** `sm` → **160px** `lg` | `py-24 sm:py-32 lg:py-40` |
| Container max width | **1280px** | `container max-w-7xl mx-auto` |
| Container horizontal padding | **16px** → **24px** `md+` | `px-4 md:px-6` |

### Two-column grid (desktop `lg+`)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Breakpoint | **1024px+** | `lg:grid` |
| Column template | **280–360px** fixed rail + fluid content | `lg:grid-cols-[minmax(280px,360px)_1fr]` |
| Column gap | **48px** `lg` → **80px** `xl` | `lg:gap-12 xl:gap-20` |
| Left column width @ 1280px container | **~360px** (36%) | from `minmax` |
| Right column width @ 1280px container | **~820px** (64%) | remainder |

```text
┌──────────────────────────────────────────────────────────────────────────┐  py-40 (160px)
│  container max-w-7xl                                                     │
│  ┌─────────────────────┬── gap 80px ──┬────────────────────────────────┐ │
│  │ // FAQ              │              │ ┌────────────────────────────┐ │ │
│  │ Questions?          │              │ │ Question text           +  │ │ │
│  │ We've got answers.  │   STICKY     │ └────────────────────────────┘ │ │
│  │                     │              │ gap 12px                         │ │
│  │                     │              │ ┌────────────────────────────┐ │ │
│  │                     │              │ │ Question (open)         ×  │ │ │
│  │                     │              │ │ Answer paragraph…          │ │ │
│  │                     │              │ └────────────────────────────┘ │ │
│  │                     │              │ …                                │ │
│  └─────────────────────┴──────────────┴────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Left column — eyebrow + headline

| Element | Size | Weight | Color | Line height | Letter spacing | Tailwind |
| ------- | ---- | ------ | ----- | ----------- | -------------- | -------- |
| Eyebrow `// FAQ` | **13px** | 400 | `#71717a` (zinc-500) | **1** | normal | `font-mono text-[13px] leading-none text-zinc-500` |
| Gap eyebrow → H2 | **20px** | — | — | — | — | `mt-5` on H2 |
| H2 line 1 `Questions?` | **44px** mobile / **56px** `lg+` | **600** (semibold) | `#ffffff` | **1.05** | **-0.03em** | `text-[2.75rem] lg:text-[3.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white` |
| H2 line 2 `We've got answers.` | same as line 1 | **600** | `#71717a` (zinc-500) | **1.05** | **-0.03em** | `block text-zinc-500` |
| H2 structure | Two `<span class="block">` lines | — | — | — | — | matches [feat-0004](../feat-0004/PRODUCT.md) header |

### Left column — sticky (desktop only)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Sticky offset from viewport top | **64px** header + **24px** breathing room = **88px** | `top: calc(var(--site-header-height, 4rem) + 1.5rem)` |
| Sticky wrapper | Full-height grid cell + inner sticky nav pattern ([feat-0004 R4](../feat-0004/PRODUCT.md#r4--sticky-nav--navbar-offset)) | outer `relative hidden lg:block`; inner header `sticky z-10` |
| Sticky ends | When FAQ section scrolls out of view | natural sticky containment |

### Right column — accordion stack

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Gap between cards | **12px** | `flex flex-col gap-3` |
| Number of items (v1) | **5** | from `_data/troott/faqs.ts` |

#### Accordion card (each item)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Card background | **`#111111`** | `bg-[#111111]` |
| Card border | **1px** `rgba(255,255,255,0.10)` | `border border-white/10` |
| Border radius | **8px** | `rounded-lg` |
| Card padding | **24px** all sides | `p-6` |
| Card min height (closed) | **~72px** (24+24 padding + ~24px question line) | implicit from content |

#### Question row (trigger)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Font size | **18px** | `text-lg` |
| Font weight | **500** (medium) | `font-medium` |
| Color | `#ffffff` | `text-white` |
| Line height | **28px** (1.556) | `leading-7` |
| Alignment | flex row, space-between | `flex items-start justify-between gap-4` |
| Icon size | **20 × 20px** | `size-5 shrink-0` |
| Icon color | `#a1a1aa` (zinc-400) | `text-zinc-400` |
| Icon collapsed | **`+`** (`RiAddLine`) | no rotation |
| Icon expanded | **`×`** appearance | `RiAddLine` **rotate 45deg** (`group-data-[state=open]:rotate-45`) — same as existing [`Accordion.tsx`](../../../apps/website/components/Accordion.tsx) |
| Icon transition | **150ms** ease | `transition-transform duration-150` |

#### Answer (content panel)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Margin top (from question) | **16px** | `mt-4` on content wrapper |
| Font size | **16px** | `text-base` |
| Font weight | **400** | `font-normal` |
| Color | `#a1a1aa` (zinc-400) | `text-zinc-400` |
| Line height | **25.6px** (1.6) | `leading-[1.6]` |
| Max width | full card minus icon gutter | `pr-2` or natural wrap; **no** full-bleed under icon |
| Animation | accordion open/close | reuse `animate-accordionOpen` / `animate-accordionClose` from site |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Add **`FaqsSection`** as a **new** homepage section; export from `components/containers/faqs/`; wire once in [`page.tsx`](../../../apps/website/app/page.tsx). |
| **Anchor** | `id="faqs"` for navbar `#faqs` link ([feat-0002](../feat-0002/PRODUCT.md)). |
| **Homepage order** | After `SplitDemoSection`, before `DownloadsSection` (see [README homepage stack](../../README.md#new-homepage-sections-feat-0007--feat-0009)). |
| **Not in v1** | Standalone `/faq` route. |

### D2 — Layout (desktop `lg+`)

| | Detail |
| --- | ------ |
| **Pattern** | Two-column grid — **not** centered single column. |
| **Left** | Eyebrow + split H2 only (no accordion in left column). |
| **Right** | Vertical stack of **independent** accordion cards (not one shared outer border). |
| **Alignment** | Left headline top-aligned with first accordion card top edge. |

### D3 — Accordion behavior

| | Detail |
| --- | ------ |
| **Radix** | `@radix-ui/react-accordion` via existing `components/Accordion.tsx` primitives **or** feat-local wrapper — same a11y contract. |
| **Mode** | `type="single"` `collapsible={true}` — **one** item open at a time; user may collapse all. |
| **Default** | **All closed** on first paint (matches reference screenshot with user-driven expand). |
| **Keyboard** | Arrow keys between triggers; `Enter` / `Space` toggle — Radix default. |

### D4 — Typography & color (pixel spec)

Normative table: [Design reference (measurements @ 1440px viewport)](#design-reference-measurements--1440px-viewport).

| Reject | Accept |
| ------ | ------ |
| Gradient clipped H2 (`bg-clip-text`) | Solid white + zinc-500 split headline |
| Single `max-w-4xl` centered column | `max-w-7xl` grid |
| Shared `border-neutral-900` wrapper around all items | Per-item `#111111` cards with **12px** gap |
| `text-6xl` / `text-7xl` FAQ title | **56px** semibold max on desktop per spec |

### D5 — Mobile (`< lg`)

| | Detail |
| --- | ------ |
| **Layout** | Single column — headline block then accordion stack (**flow**, no sticky). |
| **Headline** | Same copy; **44px** H2 (`text-[2.75rem]`). |
| **Gap headline → accordion** | **48px** | `mb-12` |
| **Cards** | Full container width; same card tokens as desktop. |
| **No** | Horizontal chips; nested accordion in left column. |

### D6 — Content model

| Field | Type | Notes |
| ----- | ---- | ----- |
| `label` | string | `// FAQ` |
| `heading` | string | `Questions?` |
| `headingMuted` | string | `We've got answers.` |
| `items[]` | `{ id, question, answer }` | stable `id` for keys / analytics |

**v1 items:** migrate existing five Q&A pairs from [`Faqs.tsx`](../../../apps/website/components/containers/Faqs.tsx) verbatim unless product edits copy in `_data`.

---

## Recommendations

### R1 — Copy

| Field | Value |
| ----- | ----- |
| `label` | `// FAQ` |
| `heading` | `Questions?` |
| `headingMuted` | `We've got answers.` |

No subtitle below the split H2 — eyebrow + two-line headline only.

### R2 — Sticky left header

Follow [feat-0004](../feat-0004/PRODUCT.md) sticky fixes:

- **No** `overflow-x-hidden` on homepage `<main>` ancestor (breaks sticky).
- **No** `items-start` on grid — use full-height left cell + `self-start` on sticky inner header only.
- Sticky applies to **header block only**, not accordion.

### R3 — Accordion card chrome

| | Recommendation |
| --- | -------------- |
| **Item wrapper** | Override default `AccordionItem` `border-b` — each item is a **card** (`rounded-lg bg-[#111111] border border-white/10 overflow-hidden`). |
| **Last item** | Same gap as others — **no** special bottom border. |
| **Hover** | Optional subtle `hover:border-white/15` on closed card — **not** required for v1 ship. |

### R4 — Accessibility

| Requirement | Implementation |
| ----------- | -------------- |
| Section | `aria-labelledby="faq-heading"` |
| H2 | `id="faq-heading"` on split headline wrapper |
| Accordion | Radix `Accordion` with labelled triggers |
| Focus | `focus-visible:ring-2 focus-visible:ring-white/40` on trigger |
| Motion | Respect `prefers-reduced-motion` — disable accordion height animation if site pattern exists |

### R5 — Homepage stack

See [README — new homepage sections](../../README.md#new-homepage-sections-feat-0007--feat-0009). This feat adds **`FaqsSection`** only; it does not reorder or modify other sections.

---

## Acceptance criteria

### Visual / UX (@ 1440px, `lg+`)

- [ ] Two-column layout: sticky left header + right accordion stack per [pixel spec](#design-reference-measurements--1440px-viewport).
- [ ] Section vertical padding **160px** top/bottom at `lg` (`py-40` within `py-24 sm:py-32 lg:py-40`).
- [ ] Column gap **80px** at `xl` (`xl:gap-20`).
- [ ] Accordion cards: **`#111111`**, **8px** radius, **24px** padding, **12px** vertical gap.
- [ ] Question **18px** white medium; answer **16px** zinc-400, **16px** top margin.
- [ ] `+` / `×` icon **20px**, right-aligned.
- [ ] Left headline matches Why Troott eyebrow/H2 scale (13px mono + 56px semibold split).
- [ ] Mobile: single column flow, no sticky, no accordion-in-header.

### Content / links

- [ ] Five FAQ items from `_data/troott/faqs.ts`.
- [ ] `id="faqs"` preserved; navbar `#faqs` scroll target unchanged.

### Accessibility

- [ ] Keyboard navigation across all triggers.
- [ ] axe pass on FAQ section.

---

## Out of scope (v1)

- FAQ search / filter
- MDX-driven FAQ page
- Contact support CTA inside section
- Light theme branches

---

## References

- Reference screenshot: `./assets/faq-two-column-reference.png`
- Current implementation: [`Faqs.tsx`](../../../apps/website/components/containers/Faqs.tsx)
- Shared accordion: [`Accordion.tsx`](../../../apps/website/components/Accordion.tsx)
- Sticky pattern: [feat-0004 PRODUCT D4](../feat-0004/PRODUCT.md#d4--scroll-driven-interaction-desktop-lg)
