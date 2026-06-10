# feat-0010: Homepage — Feature highlight (mobile mockup + rise)

## Summary

Add a **new** homepage section: a large **rounded dark panel** with **two columns** — left copy (eyebrow, headline, body, check list) and right **Launch UI `Mockup` + `Screenshot`** mobile frame that **rises on hover**.

**Design reference:** `./assets/feature-highlight-reference.png` — “Personalized Onboarding” split layout (reference screenshot; Troott copy in [R1](#r1--troott-copy)).

**Components (official):**

- [Launch UI Mockup](https://www.launchuicomponents.com/docs/components/mockup) — `Mockup type="mobile"`
- [Launch UI Screenshot](https://www.launchuicomponents.com/docs/components/screenshot) — theme-aware image inside mockup

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Placement](#d1--section-placement), [Panel layout](#d2--panel-layout), [Left column](#d3--left-column-pixel-spec), [Mockup column](#d4--mockup-column--rise-interaction), [Launch UI install](#d5--launch-ui-components), [Assets](#d6--screenshot-assets).

---

## Problem

| Today | Gap |
| ----- | --- |
| No dedicated **single-feature** block with **device mockup** on homepage | Reference layout shows high-impact product moment (copy + phone) |
| `SplitDemoSection` uses flat `next/image` in a grid — not a phone frame | Need [Launch UI Mockup](https://www.launchuicomponents.com/docs/components/mockup) + [Screenshot](https://www.launchuicomponents.com/docs/components/screenshot) |
| `hero-mockup.png` used elsewhere | Not framed; no rise interaction |
| **`Mockup` / `Screenshot` not in repo** | Must install via shadcn registry (see [D5](#d5--launch-ui-components)) |

**Goal:** Pixel QA against reference PNG @ **1440px**; Troott mobile screenshot inside `Mockup`; **rise** interaction on panel hover.

---

## Design reference (from `./assets/feature-highlight-reference.png`)

Reference content is a **health-app** marketing block. **Layout and chrome below are normative**; product strings are **Troott** in [R1](#r1--troott-copy).

### ASCII layout (@ desktop)

```text
┌ section py ──────────────────────────────────────────────────────────────┐
│  container max-w-7xl                                                     │
│  ┌ rounded panel bg #0a0a0a overflow-hidden ────────────────────────────┐ │
│  │  ┌ left column (~42%) ──────┐   gap    ┌ right column (~58%) ──────┐ │ │
│  │  │ Eyebrow (zinc-500)       │          │                             │ │ │
│  │  │ H2 white (2 lines)       │          │      [ mobile Mockup ]      │ │ │
│  │  │ Body (zinc-400)          │          │      bottom-aligned         │ │ │
│  │  │ • check + bullet ×3      │          │      clipped at panel bottom│ │ │
│  │  └──────────────────────────┘          └─────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

Hover: mockup wrapper translates UP (rise); see [D4](#d4--mockup-column--rise-interaction).
```

### Reference strings (screenshot only — do not ship on troott.com)

| Role | Reference text |
| ---- | -------------- |
| Eyebrow | Personalized Onboarding |
| Headline | Built Around You, From Day One |
| Body | Set your health preferences, body metrics, lifestyle habits, and medical background, so every recommendation feels made specifically for you. |
| Bullet 1 | Tailored health profile setup |
| Bullet 2 | Tracks body & lifestyle metrics |
| Bullet 3 | Gets smarter every session |

---

## Design reference (measurements @ 1440px viewport)

Values are **normative for QA at `lg` (1024px+)**. Measure against `./assets/feature-highlight-reference.png` in browser devtools; adjust only if reference diff exceeds **2px**.

### Section shell (outer)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `feature-highlight` | `id="feature-highlight"` |
| Outer background | page shell (`bg-background`) | `bg-background` |
| Section padding Y | **80px** → **112px** `lg` | `py-20 lg:py-28` |
| Container | **1280px** max, **16/24px** horizontal pad | `container mx-auto max-w-7xl px-4 md:px-6` |

### Inner panel (rounded card)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Panel background | **`#0a0a0a`** | `bg-[#0a0a0a]` |
| Border radius | **40px** | `rounded-[40px]` |
| Border | none in reference | no border v1 |
| Overflow | **hidden** (clips mockup bottom) | `overflow-hidden` |
| Min height @ `lg` | **~480px** | `lg:min-h-[480px]` |
| Inner grid @ `lg` | 2 columns **42% / 58%** | `lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]` |

### Left column — pixel spec

| Element | Size | Weight | Color | Spacing | Tailwind |
| ------- | ---- | ------ | ----- | ------- | -------- |
| Eyebrow | **14px** | 400 | `#71717a` (zinc-500) | — | `text-sm text-zinc-500` |
| Eyebrow style | **sans** sentence case — **not** `//` mono ([feat-0008](../feat-0008/PRODUCT.md) differs) | — | — | — | no `font-mono` |
| Eyebrow → H2 | **16px** | — | — | — | `mt-4` on H2 |
| H2 | **40px** mobile / **48px** `lg` | **600** | `#ffffff` | **1.1** LH, **-0.02em** LS | `text-[2.5rem] lg:text-[3rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white` |
| H2 max width | **~420px** | — | — | — | `max-w-[26rem]` |
| H2 → body | **20px** | — | — | — | `mt-5` |
| Body | **16px** `lg` **18px** | 400 | `#a1a1aa` (zinc-400) | **1.65** LH | `text-base lg:text-lg leading-[1.65] text-zinc-400 max-w-[26rem]` |
| Body → list | **32px** | — | — | — | `mt-8` |
| List | vertical stack | — | — | **16px** gap | `flex flex-col gap-4` |
| List item text | **16px** | 400 | `#a1a1aa` | **1.5** LH | `text-base text-zinc-400` |
| Check badge | **24×24px** circle | — | bg **`#262626`**, check **white** | — | `size-6 rounded-full bg-[#262626] flex items-center justify-center shrink-0` |
| Check icon | **12px** | — | white | — | Lucide `Check` `size-3` or `RiCheckLine` |
| Item layout | icon + text **12px** gap | — | — | — | `flex items-start gap-3` |
| Left padding | **40px** mobile / **56px** `lg` | — | — | — | `p-10 lg:p-14` |

### Right column — mockup + rise interaction

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Alignment | mockup **bottom** of panel | `flex items-end justify-center` |
| Column overflow | hidden (bottom clip) | `overflow-hidden` |
| **`Mockup`** | `type="mobile"` per [Launch UI Mockup](https://www.launchuicomponents.com/docs/components/mockup) | `<Mockup type="mobile">` |
| **`Screenshot`** | `width={175}` `height={380}` per Launch UI mobile example | see [TECH](./TECH.md) |
| Default offset | mockup **40px below** rest position (bottom clipped) | wrapper `translate-y-10` |
| Hover offset | rises **24px** vs default → net **`translate-y-4`** | `group-hover:translate-y-4` |
| Transition | **500ms** ease-out | `transition-transform duration-500 ease-out` |
| Hover trigger | **`group`** on inner panel | `group` on panel root |
| Reduced motion | no translate | `@media (prefers-reduced-motion: reduce)` → `translate-y-0`, no hover |

**Rise behavior (normative):**

```text
Default:  wrapper translate-y-10  → phone sits low; bottom of device clipped by panel
Hover:    wrapper translate-y-4    → phone moves up 24px (rises into view)
```

Apply wrapper **outside** `<Mockup>`, not inside Launch UI component source.

### Mobile (`< lg`)

| Token | Value |
| ----- | ----- |
| Layout | single column — copy block then mockup |
| Order | eyebrow → H2 → body → list → mockup |
| Mockup | centered; **no rise** required on touch (hover N/A); optional same transform at **`md+` only** |
| Panel min-height | auto |
| Mockup offset default | `translate-y-6` (less clip on small screens) |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | New **`FeatureHighlightSection`** after **`BenefitsSection`**, before **`CoreFeaturesSection`**. |
| **Anchor** | `id="feature-highlight"` |
| **Not in v1** | Second instance; `/features` route |

### D2 — Panel layout

| | Detail |
| --- | ------ |
| **Decision** | One **inner rounded panel** (`#0a0a0a`, `rounded-[40px]`) inside section container — not full-bleed black section. |
| **Reject** | Reuse `SplitDemoSection` without Mockup — different chrome (border `rounded-xl`, 40/60 grid, no phone frame). |

### D3 — Left column pixel spec

Normative table: [Left column](#left-column--pixel-spec). **Reject** feat-0008 mono `//` eyebrow for this block.

### D4 — Mockup column + rise interaction

Normative table: [Right column](#right-column--mockup--rise-interaction). Rise is **required** on desktop panel hover.

### D5 — Launch UI components

| | Detail |
| --- | ------ |
| **Install** (from `apps/website`, shadcn configured — [`components.json`](../../../apps/website/components.json)) | `npx shadcn@latest add @launchui/mockup` then `@launchui/screenshot` |
| **Imports** | `import { Mockup } from '@/components/ui/mockup'`; `import { Screenshot } from '@/components/ui/screenshot'` |
| **Usage** | Official mobile pattern from [Screenshot docs](https://www.launchuicomponents.com/docs/components/screenshot): |

```tsx
<Mockup type="mobile">
  <Screenshot
    srcLight="/images/troott-mobile-app.png"
    srcDark="/images/troott-mobile-app.png"
    alt="Troott mobile app"
    width={175}
    height={380}
  />
</Mockup>
```

| Dark-only ([feat-0001](../feat-0001/PRODUCT.md)) | Set **`srcLight` and `srcDark` to the same asset** (no light theme branch). |

### D6 — Screenshot assets

| | Detail |
| --- | ------ |
| **Decision** | Ship **`public/images/troott-mobile-app.png`** (or `.webp`) — **Troott app UI**, not reference health screenshot. |
| **Until asset exists** | Blocker for pixel QA; may use placeholder path in dev with TODO in PR. |
| **Dimensions** | Source art **≥ 350×760px** (@2x for 175×380 display); aspect ~ **1:2.17** |

---

## Recommendations

### R1 — Troott copy

| Field | Suggested value |
| ----- | --------------- |
| `eyebrow` | Personalized listening |
| `heading` | Built around you, from day one |
| `description` | Follow the ministers you trust, save sermons, and pick up where you left off — so every recommendation feels made for you. |
| `bullets[0]` | Tailored listening profile |
| `bullets[1]` | Tracks progress across sermons |
| `bullets[2]` | Gets smarter every session |

### R2 — Homepage stack

```text
…
BenefitsSection           ← feat-0008
FeatureHighlightSection   ← feat-0010 (NEW)
CoreFeaturesSection
…
```

Update [`specs/website/README.md`](../README.md) when implemented.

---

## Acceptance criteria

### Visual @ 1440px (`lg+`)

- [ ] Inner panel `bg-[#0a0a0a]`, `rounded-[40px]`, `lg:min-h-[480px]`, `overflow-hidden`
- [ ] Left column matches [pixel table](#left-column--pixel-spec)
- [ ] `Mockup type="mobile"` + `Screenshot` **175×380**
- [ ] Default mockup **clipped at bottom**; **rises 24px** on panel hover
- [ ] `prefers-reduced-motion`: no transform animation

### Components

- [ ] `@launchui/mockup` and `@launchui/screenshot` installed under `components/ui/`
- [ ] No hand-rolled phone bezel CSS unless Launch UI install fails (document in PR)

### Build

- [ ] `pnpm --filter @troott/website build`

---

## Out of scope (v1)

- Light-theme screenshot variant
- Multiple feature panels / carousel
- CTA button in left column (reference has none)
- Auto-play rise animation without hover

---

## References

- Reference PNG: `./assets/feature-highlight-reference.png`
- [Launch UI Mockup](https://www.launchuicomponents.com/docs/components/mockup)
- [Launch UI Screenshot](https://www.launchuicomponents.com/docs/components/screenshot)
- Similar split (different chrome): [`SplitDemoSection.tsx`](../../../apps/website/components/containers/split-demo/SplitDemoSection.tsx)
