# feat-0008: Homepage — Benefits 3×2 grid

## Summary

Add a **new** homepage Benefits section (`#benefits`): mono eyebrow, **split headline** (white + muted), and a **3×2 grid** of dark feature cards — each with a circular line icon, title, and description (Warp reference layout).

This is a **new section** in the homepage stack — not a modification of `CoreFeaturesSection`, `WhyTroottSection`, or other existing blocks.

**Design reference:** `./assets/warp-benefits-reference.png` — `// Benefits`, “Ship faster.” / “Code better.”, six `#111111` cards on black shell.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md). Reuses homepage header tokens from [feat-0004](../feat-0004/PRODUCT.md) / [feat-0007](../feat-0007/PRODUCT.md).

**Normative decisions:** [Placement](#d1--section-placement), [Grid](#d2--grid-layout), [Card chrome](#d3--card-chrome-pixel-spec), [Header](#d4--header-pixel-spec), [Icons](#d5--icons), [Content](#d6--content-model-troott-v1).

**Recommendations:** [R1 Copy](#r1--copy), [R2 Icons](#r2--remix-icon-map), [R3 Responsive](#r3--responsive-breakpoints), [R4 Legacy cleanup](#r4--legacy-cleanup), [R5 Homepage stack](#r5--homepage-stack).

---

## Problem

| Today | Gap |
| ----- | --- |
| No dedicated Benefits section on homepage | Marketing page lacks a scannable 3×2 value-prop grid after product surfaces |
| `CoreFeaturesSection` is deep-dive feature cards | Benefits should be **short** tiles in their own section, not merged into core features |

**Goal:** Ship a **new** pixel-aligned Benefits section at **1440px desktop width** with Troott copy and Remix line icons.

**Note:** `components/ui/Benefits.tsx` is unused careers copy — unrelated to this section; do not wire it to the homepage.

---

## Design reference (measurements @ 1440px viewport)

Reference artboard: **1440 × ~820px** visible Benefits region. Values below are **normative** for QA at `lg` (1024px+) unless a range is given.

### Section shell

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `benefits` | `id="benefits"` |
| Background | **`#000000`** (pure black shell) | `bg-black` |
| Section padding top / bottom | **80px** mobile → **96px** `sm` → **112px** `lg` | `py-20 sm:py-24 lg:py-28` |
| Container max width | **1280px** | `container max-w-7xl mx-auto` |
| Container horizontal padding | **16px** → **24px** `md+` | `px-4 md:px-6` |

### Header block (above grid)

| Element | Size | Weight | Color | Line height | Letter spacing | Tailwind |
| ------- | ---- | ------ | ----- | ----------- | -------------- | -------- |
| Eyebrow `// Benefits` | **13px** | 400 | `#71717a` (zinc-500) | **1** | normal | `font-mono text-[13px] leading-none text-zinc-500` |
| Gap eyebrow → H2 | **20px** | — | — | — | — | `mt-5` on H2 |
| H2 line 1 (primary) | **36px** mobile / **44px** `lg+` | **600** | `#ffffff` | **1.08** | **-0.03em** | `text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white` |
| H2 line 2 (muted) | same size as line 1 | **600** | `#71717a` (zinc-500) | **1.08** | **-0.03em** | `block text-zinc-500` |
| H2 structure | Two `<span class="block">` — **not** one gradient span | — | — | — | — | same split pattern as [feat-0007](../feat-0007/PRODUCT.md) |
| Gap H2 → grid | **48px** mobile → **56px** `lg` | — | — | — | — | `mt-12 lg:mt-14` on grid |

```text
┌──────────────────────────────────────────────────────────────────────────┐  py-28 (112px)
│  container max-w-7xl                                                     │
│  // Benefits                                                             │
│  Listen anywhere.                                                        │  44px white
│  Share with confidence.                                                  │  44px zinc-500
│                                                                          │
│  mt-14 (56px)                                                            │
│  ┌──────────────┐  gap 24px  ┌──────────────┐  gap 24px  ┌──────────────┐│
│  │ (icon)       │            │ (icon)       │            │ (icon)       ││
│  │ Title        │            │ Title        │            │ Title        ││
│  │ Description  │            │ Description  │            │ Description  ││
│  └──────────────┘            └──────────────┘            └──────────────┘│
│  gap 24px                                                                │
│  ┌──────────────┐            ┌──────────────┐            ┌──────────────┐│
│  │ …            │            │ …            │            │ …            ││
│  └──────────────┘            └──────────────┘            └──────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

### Benefits grid

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Breakpoint for 3 columns | **1024px+** | `lg:grid-cols-3` |
| Tablet (`md`) | **2 columns** | `md:grid-cols-2` |
| Mobile | **1 column** | `grid-cols-1` |
| Column gap | **24px** | `gap-6` |
| Row gap | **24px** (same as column) | `gap-6` |
| Card count | **6** fixed v1 | from `_data/troott/benefits.ts` |

### Benefit card (each cell)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Background | **`#111111`** | `bg-[#111111]` |
| Border | **none** (contrast via fill only) | no `border` class |
| Border radius | **12px** | `rounded-xl` |
| Padding | **32px** all sides | `p-8` |
| Text alignment | **left** | `text-left` |
| Min height | content-driven; **no** fixed height | — |

#### Icon badge (top of card)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Container size | **40 × 40px** | `size-10` |
| Container shape | circle | `rounded-full` |
| Container background | **`#000000`** | `bg-black` |
| Container border | **1px** `rgba(255,255,255,0.08)` | `border border-white/[0.08]` |
| Icon size | **20 × 20px** | `size-5` |
| Icon color | `#ffffff` | `text-white` |
| Icon style | **line** (stroke), not filled | Remix `*Line` icons |
| Gap icon → title | **24px** | `mt-6` on title |

#### Title

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Font size | **18px** | `text-lg` |
| Font weight | **600** (semibold) | `font-semibold` |
| Color | `#ffffff` | `text-white` |
| Line height | **28px** | `leading-7` |

#### Description

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Margin top | **8px** | `mt-2` |
| Font size | **15px** | `text-[15px]` |
| Font weight | **400** | `font-normal` |
| Color | `#a1a1aa` (zinc-400) | `text-zinc-400` |
| Line height | **24px** (1.6) | `leading-[1.6]` |
| Max width | natural wrap within card | no truncate |

---

## Design reference (Warp → Troott mapping)

| Warp card (reference) | Troott v1 |
| --------------------- | --------- |
| `// Benefits` | `// Benefits` |
| Ship faster. / Code better. | **Listen anywhere.** / **Share with confidence.** |
| Full codebase understanding | **Every sermon in one place** |
| Works out of the box | **Works on mobile and web** |
| Your code stays yours | **Your uploads stay private** |
| Instant responses | **Instant playback** |
| Every language you use | **Listen in the background** |
| Refactor with confidence | **Share with one link** |

Reference image: `./assets/warp-benefits-reference.png`

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Add **`BenefitsSection`** as a **new** homepage section; export from `components/containers/benefits/`; wire once in [`page.tsx`](../../../apps/website/app/page.tsx). |
| **Anchor** | `id="benefits"`. |
| **Order** | After `WhyTroottSection`, before `CoreFeaturesSection` (see [README homepage stack](../../README.md#new-homepage-sections-feat-0007--feat-0009)). |
| **Why** | Product surfaces → scannable value props → deeper feature cards. |
| **Not in v1** | `/benefits` route; ministers landing duplicate. |

### D2 — Grid layout

| | Detail |
| --- | ------ |
| **Decision** | **3×2** on `lg+`; **2×3** on `md`; **1×6** on mobile. |
| **Reject** | 4-column legacy layout from `Benefits.tsx`. |
| **Reject** | Horizontal scroll carousel of cards. |

### D3 — Card chrome (pixel spec)

Normative table: [Benefit card](#benefit-card-each-cell) above.

| Reject | Accept |
| ------ | ------ |
| Gradient H2 | Split white + zinc-500 headline |
| Card border `white/10` (FAQ style) | **No border** — `#111111` on `#000000` only |
| Filled Remix icons | **Line** icons in black circle badge |
| `rounded-2xl` (16px) | **`rounded-xl` (12px)** per reference |

### D4 — Header pixel spec

Normative table: [Header block](#header-block-above-grid) above.

| Reject | Accept |
| ------ | ------ |
| FAQ-scale **56px** H2 | Benefits H2 **44px** on desktop — shorter section header |
| Single-line gradient clip | Two-line split headline |

### D5 — Icons

| | Detail |
| --- | ------ |
| **Library** | `@remixicon/react` — `*Line` variants only |
| **Container** | 40px black circle with subtle border — **not** square feat-0004 tab icon |
| **Decorative** | `aria-hidden="true"` on icon SVG; meaning in title text |

### D6 — Content model (Troott v1)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `label` | string | `// Benefits` |
| `heading` | string | `Listen anywhere.` |
| `headingMuted` | string | `Share with confidence.` |
| `items[]` | `{ id, icon, title, description }` | exactly **6** items; stable `id` |

---

## Recommendations

### R1 — Copy

| Field | Value |
| ----- | ----- |
| `label` | `// Benefits` |
| `heading` | `Listen anywhere.` |
| `headingMuted` | `Share with confidence.` |

### R2 — Remix icon map

| `id` | Icon | Title | Description |
| ---- | ---- | ----- | ----------- |
| `library` | `RiBookOpenLine` | Every sermon in one place | Find teachings from ministers you follow — organized, searchable, always available. |
| `everywhere` | `RiSmartphoneLine` | Works on mobile and web | Start on your phone, pick up in the browser. One account, every device. |
| `private` | `RiLockLine` | Your uploads stay private | Drafts and unpublished sermons stay in your studio until you are ready to share. |
| `instant` | `RiFlashlightLine` | Instant playback | Stream sermons without long waits — optimized audio delivery from upload to listen. |
| `background` | `RiHeadphoneLine` | Listen in the background | Keep listening while you use other apps — built for commutes, walks, and daily devotion. |
| `share` | `RiShareForwardLine` | Share with one link | Send a sermon to family or your congregation with a link that works everywhere. |

### R3 — Responsive breakpoints

| Viewport | Grid | Header H2 |
| -------- | ---- | --------- |
| `< md` | 1 col | 36px |
| `md–lg` | 2 col | 36px |
| `lg+` | 3 col | 44px |

### R4 — Unused UI module

| Item | Action |
| ---- | ------ |
| `components/ui/Benefits.tsx` | **Do not** wire to homepage (unrelated careers component) |
| New section code | `components/containers/benefits/` only |

### R5 — Homepage stack

See [README — new homepage sections](../../README.md#new-homepage-sections-feat-0007--feat-0009). This feat adds **`BenefitsSection`** only; it does not reorder or modify other sections.

---

## Acceptance criteria

### Visual / UX (@ 1440px, `lg+`)

- [ ] Section `id="benefits"`, `bg-black`, padding **112px** vertical (`py-28`).
- [ ] Eyebrow **13px** mono zinc-500; H2 **44px** semibold split white / zinc-500.
- [ ] Grid **3×2**, gap **24px**, cards **`#111111`**, **12px** radius, **32px** padding.
- [ ] Icon badge **40px** black circle, **20px** white line icon.
- [ ] Title **18px** semibold white; description **15px** zinc-400.
- [ ] Mobile **1 col**; `md` **2 col** — no horizontal scroll.

### Content

- [ ] Six items from `_data/troott/benefits.ts` per [R2](#r2--remix-icon-map).

### Accessibility

- [ ] Section `aria-labelledby="benefits-heading"`.
- [ ] H2 `id="benefits-heading"`.
- [ ] Cards use semantic `<article>` or `<li>` inside `<ul>` grid.

### Build

- [ ] `pnpm --filter @troott/website build` passes.

---

## Out of scope (v1)

- Card hover lift / border glow
- CTA links inside cards
- Animated icons
- Light theme

---

## References

- Reference screenshot: `./assets/warp-benefits-reference.png`
- Legacy (do not reuse): [`Benefits.tsx`](../../../apps/website/components/ui/Benefits.tsx)
- Header pattern: [feat-0007 PRODUCT — left headline](../feat-0007/PRODUCT.md#left-column--eyebrow--headline)
