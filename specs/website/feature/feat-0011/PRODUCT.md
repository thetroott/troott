# feat-0011: Homepage — vertical tabs + single visual panel (Warp Terminal)

## Summary

Add a **new** homepage section on `apps/website` with a **two-column layout**: **vertical tab list** (left) and **one active visual panel** (right). Clicking a tab swaps the right visual in place. The active tab expands into a **dark card** with a **purple top accent** and shows title + description; inactive tabs show **title only** in muted gray.

**Design reference:** `./assets/warp-vertical-tabs-reference.png` — Warp Terminal “Agent workflows that feel native” block (TERMINAL label, subtitle, divider, vertical tabs, notification cards over landscape art).

This is a **new section** — distinct from:

- [feat-0004](../feat-0004/PRODUCT.md) — scroll-spy **stacked** sections (all four panels in document flow)
- [feat-0009](../feat-0009/PRODUCT.md) — Exact **horizontal segmented** tabs + footer row

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Placement](#d1--section-placement), [Layout](#d2--two-column-desktop-layout), [Header](#d3--section-header), [Vertical tabs](#d4--vertical-tab-list), [Visual panel](#d5--visual-panel), [Content](#d6--content-model), [Mobile](#d7--mobile-layout).

**Recommendations:** [R1 Troott copy](#r1--troott-copy), [R2 Visual fidelity](#r2--visual-fidelity-vs-warp-reference), [R3 Motion](#r3--motion--reduced-motion), [R4 Homepage stack](#r4--homepage-stack).

**Normative rule:**

> At `lg` (≥1024px), only **one** right-column visual is visible. Tab change updates left active card + right image **in place** (no scroll-spy, no stacked scroll sections, no horizontal pill bar).

---

## Problem

| Today | Gap |
| ----- | --- |
| [feat-0009](../feat-0009/PRODUCT.md) covers Exact horizontal tabs | No Warp **vertical** tab pattern with expanded active card |
| [feat-0004](../feat-0004/PRODUCT.md) uses scroll-spy stacked panels | Reference uses **click-to-switch** single panel — different UX |
| Product story needs a “workflows / surfaces” moment | Reference layout communicates depth per tab without long scroll |

**Goal:** Pixel-aligned section at **1440px** desktop width. Troott copy from `why-troott.ts` (or dedicated data file); Troott product screenshots in the visual panel (no Warp notification-card overlay in v1).

**Calibration viewport:** 1440 × 900 CSS px, 1× DPR, dark mode. All `px` values in pixel tables are CSS pixels at this width unless noted.

---

## Design reference (Warp → Troott)

| Warp reference element | Troott v1 |
| ---------------------- | --------- |
| Eyebrow `TERMINAL` | `TROOTT APP` or `// Why Troott` (see [R1](#r1--troott-copy)) |
| H2 `Agent workflows that feel native.` | Troott headline (two-line optional) |
| Subtitle under H2 | One supporting sentence |
| Tab `Notifications` | **Troott App** |
| Tab `Vertical tabs` | **Troott Studio** |
| Tab `Interactive code review` | **Share & grow** / **For churches** (four tabs total) |
| Active tab body copy | `tab.description` from data |
| Right panel notification cards | **Out of v1** — full-bleed `next/image` product screenshot per tab |
| Landscape background art | Tab `image.src` (`object-cover`, rounded frame) |

Reference image: `./assets/warp-vertical-tabs-reference.png`.

---

## Design reference (measurements @ 1440px viewport)

Reference artboard: **1440 × ~820px** visible section region. Values below are **normative** for QA at `lg` (1024px+) unless a range is given. Tolerance: **±2px** vs reference PNG in browser devtools.

### Section shell

```text
┌─ viewport 1440px ─────────────────────────────────────────────────────────────┐
│  site header (64px, --site-header-height)                                      │
├─ section py 112px ────────────────────────────────────────────────────────────┤
│  ┌─ container max-w-1280px, mx-auto, px 24px ─────────────────────────────┐ │
│  │  [header: label + H2 + subtitle]                                          │ │
│  │  ───────────── horizontal rule ─────────────                              │ │
│  │  ┌─ left tabs (~32%) ─┐   gap 48–64px   ┌─ right visual (~68%) ────────┐ │ │
│  │  │  inactive title    │                  │  rounded image panel          │ │ │
│  │  │  ┌ active card ──┐ │                  │  (16:10 aspect)               │ │ │
│  │  │  │ accent + copy │ │                  │                               │ │ │
│  │  │  └───────────────┘ │                  │                               │ │ │
│  │  │  inactive title    │                  │                               │ │ │
│  │  └────────────────────┘                  └───────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `product-workflows` | `id="product-workflows"` |
| Background | `#000000` / `bg-background` | `bg-background` |
| Section padding Y | **80px** mobile → **112px** `sm+` | `py-20 sm:py-28` |
| Container max width | **1280px** | `max-w-7xl` |
| Container horizontal padding | **16px** `< md` → **24px** `md+` | `px-4 md:px-6` |
| Content width @ 1440 | **1232px** | — |

### Header block

#### Eyebrow label

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy (reference) | `TERMINAL` | Troott: see [R1](#r1--troott-copy) |
| Font | sans **11px** → **12px** `sm+` | `text-[11px] sm:text-xs` |
| Weight | **500** | `font-medium` |
| Transform | **uppercase** | `uppercase` |
| Tracking | **0.08em** | `tracking-[0.08em]` |
| Color | `#71717A` | `text-zinc-500` |
| Margin to H2 | **16px** | `mt-4` on `h2` |

#### Section heading (`h2`)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy (reference) | `Agent workflows that feel native.` | Troott headline — single line or two-line split |
| Font | Matter SemiBold | `font-semibold` |
| Size | **36px** → **40px** `sm` → **44px** `lg` | `text-4xl sm:text-[2.5rem] lg:text-[2.75rem]` |
| Line height | **1.1** | `leading-[1.1]` |
| Letter spacing | **−0.02em** | `tracking-[-0.02em]` |
| Color | `#FFFFFF` | `text-white` |
| `id` | `product-workflows-heading` | `aria-labelledby` target |
| Max width | **~720px** | `max-w-3xl` |

#### Subtitle (reference only — below H2)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Copy (reference) | `Switch between assisted and manual workflows without leaving the terminal.` | Troott supporting line |
| Size | **16px** → **18px** `lg` | `text-base lg:text-lg` |
| Line height | **1.6** | `leading-[1.6]` |
| Color | `#A1A1AA` | `text-zinc-400` |
| Max width | **~640px** | `max-w-2xl` |
| Margin top | **12px** | `mt-3` |

#### Header → divider → grid

| Gap | px |
| --- | -- |
| Eyebrow → H2 | 16 |
| H2 → subtitle | 12 |
| Subtitle → divider | **32px** | `mt-8` on rule wrapper |
| Divider → tab grid | **32px** | `mt-8` on grid |

#### Horizontal rule

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Height | **1px** | `h-px` |
| Color | `white` @ **10%** | `bg-white/10` |
| Width | full container | `w-full` |

### Two-column grid (`lg+`)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Layout | 2 columns | `lg:grid lg:grid-cols-[minmax(280px,360px)_1fr]` |
| Column gap | **48px** → **64px** `xl` | `lg:gap-12 xl:gap-16` |
| Align | top | `items-start` |

### Vertical tab list

`nav` + `ul[role="tablist"]` — **vertical** stack. Each `li` contains one `button[role="tab"]`.

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| List direction | column | `flex flex-col` |
| Gap between tab rows | **0** (dividers separate) | — |
| Tab button width | full column | `w-full text-left` |
| Focus ring | white 40% | `focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background` |

#### Inactive tab (title only)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Padding Y | **20px** | `py-5` |
| Padding X | **0** (flush left) | `px-0` |
| Title size | **16px** → **18px** `lg` | `text-base lg:text-lg` |
| Title weight | **500** | `font-medium` |
| Title color | `#52525B` | `text-zinc-600` |
| Hover title | `#A1A1AA` | `hover:text-zinc-400` |
| Description | **hidden** | not rendered when inactive |
| Background | none | `bg-transparent` |
| Border bottom | **1px** `white/10` between items | `border-b border-white/10` on `li` |

#### Active tab (expanded card)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Container margin Y | **8px** inset from row | `my-2` on active `li` or inner wrapper |
| Background | `#161616` | `bg-[#161616]` |
| Border radius | **8px** | `rounded-lg` |
| Padding | **24px** | `p-6` |
| Position | relative (for accent) | `relative` |

##### Purple top accent (active only)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Position | top edge of active card | `absolute inset-x-0 top-0` |
| Height | **2px** | `h-0.5` |
| Color | `#A855F7` (violet-500) | `bg-violet-500` |
| Radius | follows card top | `rounded-t-lg` |

##### Active tab title

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Size | **18px** → **20px** `lg` | `text-lg lg:text-xl` |
| Weight | **600** | `font-semibold` |
| Color | `#FFFFFF` | `text-white` |
| Margin below | **12px** | `mb-3` |

##### Active tab description

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Size | **14px** → **15px** `lg` | `text-sm lg:text-[15px]` |
| Line height | **1.65** | `leading-[1.65]` |
| Color | `#A1A1AA` | `text-zinc-400` |
| Max width | column width | — |

**Reject:** left icon rail per [feat-0004](../feat-0004/PRODUCT.md); horizontal segmented pills per [feat-0009](../feat-0009/PRODUCT.md); scroll-spy stacked sections.

#### Tab labels (Troott v1)

| `tab.id` | Nav title (`navLabel`) |
| -------- | ---------------------- |
| `listen` | Troott App |
| `studio` | Troott Studio |
| `share` | Share & grow |
| `churches` | For churches |

### Visual panel (right column)

| Property | Value | Tailwind |
| -------- | ----- | -------- |
| Role | `role="tabpanel"` | `aria-labelledby` → active tab id |
| Aspect ratio | **16 / 10** | `aspect-[16/10]` |
| Min height | **320px** `< lg` | `min-h-[320px]` |
| Border radius | **16px** | `rounded-2xl` |
| Overflow | hidden | `overflow-hidden` |
| Border | **none** in reference | no border v1 |
| Image | `next/image` `fill` `object-cover` | per active tab |
| `sizes` | `(max-width: 1024px) 100vw, 58vw` | — |
| Transition on tab change | crossfade **200ms** | opacity fade; see [R3](#r3--motion--reduced-motion) |

**Out of v1:** floating notification cards, approve/decline buttons, painted art + UI composite — ship **Troott product screenshots** only.

### Mobile (`< lg`)

| Property | Value |
| -------- | ----- |
| Layout | single column: header → **horizontal scroll chips** OR **stacked accordion** |
| **Normative v1** | **Horizontal scroll tab chips** above visual (Warp mobile pattern) |
| Chip height | **36px** | `h-9` |
| Chip padding | **16px** horizontal | `px-4` |
| Active chip | `bg-[#161616] text-white` + `border-t-2 border-violet-500` |
| Inactive chip | `bg-transparent text-zinc-500 border border-white/10` |
| Description | shown **below chips**, above visual, when tab active |
| Visual | full width, same 16:10 card |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | New **`ProductWorkflowsSection`** (working name) on homepage — placement TBD in [R4](#r4--homepage-stack); anchor **`#product-workflows`**. |
| **Not in v1** | Replace `WhyTroottTabsSection` or `WhyTroottSection` without product sign-off. |

### D2 — Two-column desktop layout

| | Detail |
| --- | ------ |
| **Decision** | `lg+` grid: **~32%** tabs / **~68%** visual per [pixel table](#two-column-grid-lg). |
| **Reject** | Stacked scroll sections ([feat-0004](../feat-0004/PRODUCT.md)); single-column Exact layout ([feat-0009](../feat-0009/PRODUCT.md)). |

### D3 — Section header

| | Detail |
| --- | ------ |
| **Decision** | Eyebrow + H2 + **subtitle** + **full-width divider** before tab grid — matches reference. |
| **Reject** | `//` mono-only header without subtitle (differs from this reference). |

### D4 — Vertical tab list

| | Detail |
| --- | ------ |
| **Decision** | Inactive = **title only**; active = **card** with **violet top accent** + title + description. |
| **Interaction** | Click / keyboard activates tab; updates `activeTabId`; no scroll coupling. |
| **Default tab** | `listen` |

### D5 — Visual panel

| | Detail |
| --- | ------ |
| **Decision** | One `tabpanel`; image swaps on tab change. |
| **Out of v1** | Warp notification overlay components. |

### D6 — Content model

| | Detail |
| --- | ------ |
| **Decision** | Reuse [`why-troott.ts`](../../../apps/website/_data/troott/why-troott.ts) schema; add optional `subtitle` on section content type if needed. |
| **Fields used** | `navLabel`, `description`, `image`; section-level `label`, `heading`, new `subtitle`. |
| **Fields unused in v1** | `eyebrow`, `title`, `cta` in tab panel (no footer CTA row in this layout). |

### D7 — Mobile layout

| | Detail |
| --- | ------ |
| **Decision** | Horizontal scroll chips + description snippet + visual ([Mobile table](#mobile--lg)). |
| **Reject** | Desktop-only section hidden on mobile. |

---

## Recommendations

### R1 — Troott copy

| Field | Suggested value |
| ----- | --------------- |
| `label` | `TROOTT` or `WHY TROOTT` (uppercase sans — matches reference `TERMINAL`) |
| `heading` | Workflows that feel native. |
| `subtitle` | Switch between listening, publishing, and sharing without leaving Troott. |
| Tab titles | `navLabel` from `why-troott.ts` |
| Tab descriptions | `description` from `why-troott.ts` |

### R2 — Visual fidelity vs Warp reference

| Element | Warp reference | Troott v1 |
| ------- | -------------- | --------- |
| Page background | Pure black | `bg-background` |
| Active tab card | `#161616` + violet top line | Same |
| Inactive tab | Muted title only | `text-zinc-600` |
| Right panel | Art + notification cards | Product screenshot only |
| Purple accent | `#A855F7` | `bg-violet-500` — Troott brand may substitute **teal** only with design sign-off |

### R3 — Motion & reduced motion

| | Detail |
| --- | ------ |
| Tab swap | Image + description **opacity crossfade** ~200ms `ease-out` |
| `prefers-reduced-motion: reduce` | Instant swap, no fade |
| No | Auto-rotate carousel |

### R4 — Homepage stack

Proposed insertion (product to confirm):

```text
…
WhyTroottTabsSection     ← feat-0009
ProductWorkflowsSection  ← feat-0011 (NEW)
BenefitsSection          ← feat-0008
…
```

Update [`specs/website/README.md`](../README.md) when placement is approved.

---

## Measurement checklist (QA @ 1440px)

- [ ] Section `py-28`, container `max-w-7xl px-6`
- [ ] Eyebrow uppercase `text-xs text-zinc-500 tracking-[0.08em]`
- [ ] H2 `text-[2.75rem] leading-[1.1] text-white`
- [ ] Subtitle `text-lg text-zinc-400 max-w-2xl`
- [ ] Divider `h-px bg-white/10` with **32px** margin above grid
- [ ] Grid `lg:grid-cols-[minmax(280px,360px)_1fr] gap-12`
- [ ] Inactive tab: title only, `text-zinc-600`, `py-5`, bottom border
- [ ] Active tab: `bg-[#161616] rounded-lg p-6`, **2px** `bg-violet-500` top accent
- [ ] Active title `text-xl font-semibold text-white`; body `text-sm text-zinc-400`
- [ ] Visual `aspect-[16/10] rounded-2xl overflow-hidden`
- [ ] Only one `tabpanel` visible; keyboard arrows move between tabs
- [ ] Mobile: horizontal chips + description + visual

---

## Acceptance criteria

### Visual @ 1440px (`lg+`)

- [ ] Header matches [Header block](#header-block) pixel tables
- [ ] Vertical tabs match [Vertical tab list](#vertical-tab-list) — active card + violet accent
- [ ] Right panel 16:10 image, `rounded-2xl`
- [ ] No horizontal pill bar; no scroll-spy sidebar icons

### Interaction

- [ ] Click tab → updates active card + swaps image
- [ ] `role="tablist"` / `role="tab"` / `role="tabpanel"`; arrow keys; `aria-selected`
- [ ] Default tab `listen`

### Build

- [ ] `pnpm --filter @troott/website build`

---

## Out of scope (v1)

- Warp notification card overlay on visual
- Footer CTA row (Exact feat-0009 pattern)
- Scroll-driven tab progression ([feat-0004](../feat-0004/PRODUCT.md))
- `?tab=` URL deep links
- Light theme

---

## References

- Reference PNG: `./assets/warp-vertical-tabs-reference.png`
- Related: [feat-0004](../feat-0004/PRODUCT.md) (scroll-spy), [feat-0009](../feat-0009/PRODUCT.md) (horizontal tabs)
- Data: [`why-troott.ts`](../../../apps/website/_data/troott/why-troott.ts)
