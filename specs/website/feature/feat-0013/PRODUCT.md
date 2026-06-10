# feat-0013: Homepage — App showcase (center phone + floating tile marquees)

## Summary

Add a **new** homepage section: a **centered mobile mockup** overlapping **two horizontal marquee rows** of floating tiles (photo cards + icon/label cards). Left and right edges **fade into the section background** via gradient masks.

**Design reference:** `./assets/app-showcase-reference.png` — habit-app “Weekly Overview” hero with lifestyle photo tiles and action chips flanking a phone (reference screenshot; Troott copy and assets in [R1](#r1--troott-copy) / [R2](#r2--assets-from-appswebsite)).

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md) — layout and motion match reference; colors use Troott dark tokens ([D5](#d5--troott-dark-adaptation)).

**Reuse (no new npm packages):**

| Piece | Source in `apps/website` |
| ----- | ------------------------ |
| Horizontal marquee rows | [`components/magicui/marquee.tsx`](../../../apps/website/components/magicui/marquee.tsx) |
| Edge fade masks | [`ProgressiveBlur`](../../../apps/website/components/ui/progressive-blur.tsx) + `from-background` gradients ([`logo-cloud`](../../../apps/website/components/containers/logo-cloud/LogoCloudSection.tsx) pattern) |
| Center phone image | [`public/blocks/phone-screenshot-appstore.png`](../../../apps/website/public/blocks/phone-screenshot-appstore.png) |
| Photo tiles | Minister / lifestyle JPGs under [`public/images/`](../../../apps/website/public/images/) (same set as [`UserSection.tsx`](../../../apps/website/components/containers/UserSection.tsx)) |
| Icon tiles | Remix `*Line` icons (same family as [feat-0008](../feat-0008/PRODUCT.md)) |

**Normative decisions:** [Placement](#d1--section-placement), [Layout](#d2--layout), [Tile chrome](#d3--tile-pixel-spec), [Phone](#d4--center-phone), [Edge masks](#edge-fade-masks), [Dark adaptation](#d5--troott-dark-adaptation), [Motion](#d6--marquee-motion), [Content](#d7--content-model).

---

## Problem

| Today | Gap |
| ----- | --- |
| No **full-bleed visual showcase** with floating tiles + center device on homepage | Reference layout is high-impact product moment (device surrounded by use-case chips) |
| `UserSection` / `BentoDemo` uses vertical bento grid — different pattern | Need **dual horizontal marquees** + **center overlap** |
| `FeatureHighlightSection` ([feat-0010](../feat-0010/PRODUCT.md)) is split copy + single phone in a panel | This section is **visual-only** (no left copy column) |
| Minister photos exist but unused in a marquee gallery | Reuse `/images/*` assets already in repo |

**Goal:** Pixel QA against reference PNG @ **1440px**; Troott sermon-listening tiles; center phone from `/blocks`; edge blends on dark shell.

---

## Design reference (from `./assets/app-showcase-reference.png`)

Reference is a **light** habit-app marketing block. **Geometry, tile sizes, marquee structure, and phone overlap below are normative**; strings and photos are **Troott** in [R1](#r1--troott-copy).

### Reference strings (do not ship on troott.com)

| Role | Reference text |
| ---- | -------------- |
| Icon tile 1 | Stretch for 5 minutes |
| Icon tile 2 | Track water |
| Icon tile 3 | Morning walk |
| Icon tile 4 | Clean workspace |
| Icon tile 5 | Meditate |
| Phone screen | Weekly Overview, Routine stacks, AI suggestions |

### ASCII layout (@ desktop 1440px)

```text
┌ section overflow-hidden bg-background ───────────────────────────────────┐
│  py ~96px                                                                │
│  ┌ relative stage min-h ~560px ─────────────────────────────────────────┐ │
│  │  [fade L]  ←── row 1 marquee (photo + icon tiles) ──→  [fade R]    │ │
│  │                         ┌──────────┐                               │ │
│  │                         │  PHONE   │  z-30, centered               │ │
│  │                         │ mockup   │  overlaps both rows           │ │
│  │                         └──────────┘                               │ │
│  │  [fade L]  ←── row 2 marquee (opposite direction) ──→  [fade R]    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

Row 1 sits **slightly above** vertical center; row 2 **slightly below** — phone straddles the gap between rows.

---

## Design reference (measurements @ 1440px viewport)

Values are **normative for QA at `lg` (1024px+)** unless a range is given. Calibrate against `./assets/app-showcase-reference.png`; adjust only if diff exceeds **2px**.

### Section shell

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `app-showcase` | `id="app-showcase"` |
| Background | page shell `#0a0a0a` | `bg-background` |
| Section padding Y | **80px** → **96px** `lg` | `py-20 lg:py-24` |
| Outer overflow | hidden (clips marquee + masks) | `overflow-hidden` |
| Stage min-height | **560px** `lg` | `lg:min-h-[560px]` |
| Horizontal bleed | full container width | `w-full` inside `max-w-7xl` optional — **prefer full-bleed** stage (`w-screen relative left-1/2 -translate-x-1/2`) |

### Marquee rows

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Row count | **2** | two `<Marquee>` instances |
| Row gap (vertical) | **20px** | `gap-5` on stage flex/grid |
| Row 1 offset | **~8px above** stage vertical center | `absolute top-[calc(50%-132px-10px)]` or flex `items-center` with negative margin on phone wrapper |
| Row 2 offset | **~8px below** center | symmetric to row 1 |
| Tile gap (horizontal) | **16px** | `[--gap:1rem]` on `Marquee` |
| Marquee duration | **~45s** per loop | `[--duration:45s]` |
| Row 1 direction | LTR (default) | `reverse={false}` |
| Row 2 direction | RTL | `reverse={true}` |
| Pause on hover | yes (desktop) | `pauseOnHover` |
| Reduced motion | static wrap grid, no animation | `prefers-reduced-motion: reduce` |

### Tile — photo card

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Size | **132 × 132px** | `size-[132px] shrink-0` |
| Border radius | **20px** | `rounded-[20px]` |
| Overflow | hidden | `overflow-hidden` |
| Image | `fill object-cover` | `next/image` |
| Border | **1px** `white/10` | `border border-white/10` |
| Shadow | soft lift | `shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]` |

### Tile — icon + label card

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Size | **132 × 132px** (same as photo) | `size-[132px]` |
| Border radius | **20px** | `rounded-[20px]` |
| Background | `#161616` (dark adapt of ref white) | `bg-[#161616]` |
| Border | **1px** `white/10` | `border border-white/10` |
| Inner layout | column, centered | `flex flex-col items-center justify-center gap-3 p-4` |
| Icon badge | **40 × 40px** circle | `size-10 rounded-full` |
| Icon glyph | **20px** | `size-5` |
| Label | **13px** Regular, centered, max 2 lines | `text-[13px] leading-tight text-zinc-400 text-center` |
| Badge colors (normative) | see [R1 icon map](#r1--troott-copy) | `bg-*` per tile `accent` token |

### Center phone

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Asset | `/blocks/phone-screenshot-appstore.png` | Troott library UI (already in repo) |
| Display width | **272px** | `w-[272px]` |
| Display height | auto (preserve aspect) | `h-auto` |
| Position | absolute center of stage | `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` |
| `z-index` | **30** (above tiles) | `z-30` |
| Shadow | device depth | `drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]` |
| **Reject** | Launch UI `Mockup` frame double-bezel on this asset | asset already includes device chrome |

### Edge fade masks

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Mask width (each side) | **128px** `lg` | `w-32` |
| Left mask | solid → transparent L→R | `bg-gradient-to-r from-background to-transparent` |
| Right mask | transparent → solid R→L | `bg-gradient-to-l from-background to-transparent` |
| Optional blur | match logo cloud | `ProgressiveBlur` `direction="left"` / `"right"` |
| `z-index` | **20** (above tiles, below phone) | `z-20 pointer-events-none` |
| Apply per row | yes — each row wrapper gets masks | duplicate mask pair top + bottom rows |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | New **`AppShowcaseSection`** on homepage **after `FeatureHighlightSection`**, **before `CoreFeaturesSection`**. |
| **Anchor** | `id="app-showcase"` |
| **Why** | Visual “product in context” beat after single-feature highlight; before feature grid |
| **Not in v1** | Standalone route; second instance |

### D2 — Layout

| | Detail |
| --- | ------ |
| **Decision** | **Visual-only** stage — no eyebrow/headline in this section (reference has none). |
| **Structure** | Two marquee rows + absolutely centered phone; stage `relative` + `overflow-hidden`. |
| **Reject** | Reuse `BentoGrid` vertical layout from `UserSection` without marquee rows |
| **Reject** | Copy column beside tiles (that is feat-0010 / feat-0012) |

### D3 — Tile pixel spec

Normative tables: [Photo tile](#tile--photo-card), [Icon tile](#tile--icon--label-card).

### D4 — Center phone

Normative table: [Center phone](#center-phone). Use **flat** `next/image` — screenshot PNG includes bezel.

### D5 — Troott dark adaptation

| Reference (light) | Troott v1 |
| ----------------- | --------- |
| White page / tile bg | `bg-background` / `bg-[#161616]` icon tiles |
| Light gray photo borders | `border-white/10` |
| Colorful icon badges | Keep hue; reduce saturation slightly (`/90` opacity) |
| White phone shadow | Dark `drop-shadow` (see table) |

### D6 — Marquee motion

| | Detail |
| --- | ------ |
| **Decision** | Row 1 scrolls **left**; row 2 scrolls **right** (`reverse`) — matches reference parallax feel. |
| **Mobile (`< lg`)** | **No marquee** — single static row of **4** tiles + centered phone below (stacked). |
| **A11y** | `aria-hidden` on decorative tile rows; phone `alt` from data |

### D7 — Content model

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | `'app-showcase'` | section anchor |
| `phone` | `{ src, alt, width }` | center asset |
| `rows[0].tiles[]` | `ShowcaseTile[]` | top marquee |
| `rows[1].tiles[]` | `ShowcaseTile[]` | bottom marquee |

```ts
type ShowcaseTile =
  | { id: string; kind: 'photo'; src: string; alt: string }
  | {
      id: string;
      kind: 'action';
      icon: RemixiconComponentType;
      label: string;
      accent: 'cyan' | 'orange' | 'violet' | 'rose' | 'blue';
    };
```

**v1 tile count:** **6–8 tiles per row** (duplicate children in `Marquee` `repeat={2}` minimum for seamless loop).

---

## Recommendations

### R1 — Troott copy (icon tiles)

| `id` | Icon | Label | `accent` |
| ---- | ---- | ----- | -------- |
| `listen` | `RiHeadphoneLine` | Listen anywhere | `cyan` |
| `save` | `RiBookmarkLine` | Save sermons | `blue` |
| `share` | `RiShareForwardLine` | Share a message | `orange` |
| `playlist` | `RiPlayListAddLine` | Build playlists | `violet` |
| `resume` | `RiTimeLine` | Pick up where you left off | `rose` |
| `discover` | `RiCompass3Line` | Discover ministers | `cyan` |

Photo tiles: rotate minister images from [R2](#r2--assets-from-appswebsite) — no text overlay.

### R2 — Assets from `apps/website`

**Center phone (required v1):**

| Path | Usage |
| ---- | ----- |
| `/blocks/phone-screenshot-appstore.png` | Center mockup (Troott library UI) |
| `/blocks/phone-screenshot-appstor-play.png` | Optional alt if product prefers Play-store frame |

**Photo tiles (pick 6–8, no new uploads):**

| Path | Alt |
| ---- | --- |
| `/images/apst-joshua-selman-.jpg` | Apostle Joshua Selman |
| `/images/apst-tolu-agboola.jpg` | Apostle Tolu Agboola |
| `/images/apst-arome-osayi.jpg` | Apostle Arome Osayi |
| `/images/rev-felix-adejumo.jpg` | Rev Funke Felix Adejumo |
| `/images/apostle-jd.jpg` | Apostle Jesudamilare Adesegun-David |
| `/images/abenezer-shewaga.jpg` | Abenezer Shewaga |
| `/images/jay-soundo.jpg` | Jay Soundo |
| `/images/fourty-four.jpg` | Forty Four |

**Rejected v1:** External CDN lifestyle stock; reference health-app screenshots; `hero-mockup.png` (hand composite — wrong crop for tile grid).

### R3 — Homepage stack

```text
…
FeatureHighlightSection   ← feat-0010
AppShowcaseSection        ← feat-0013 (NEW)
CoreFeaturesSection
…
```

Update [`specs/website/README.md`](../README.md) when implemented.

---

## Acceptance criteria

### Visual @ 1440px (`lg+`)

- [ ] Two marquee rows with **132px** tiles, **16px** gap, opposite scroll directions
- [ ] Center phone **272px** wide, overlaps rows, `z-30`
- [ ] Left/right **128px** gradient masks blend tiles into `bg-background`
- [ ] Icon tiles use Remix icons + Troott labels ([R1](#r1--troott-copy))
- [ ] Photo tiles use `/images/*` minister art ([R2](#r2--assets-from-appswebsite))

### Motion & a11y

- [ ] `pauseOnHover` on desktop marquees
- [ ] `prefers-reduced-motion`: static layout, no `animate-marquee`

### Build

- [ ] `pnpm --filter @troott/website build`

---

## Out of scope (v1)

- Light-theme variant
- Clickable tiles / deep links
- Auto-scroll tied to scroll position
- New photography uploads
- Text headline above stage (add in feat-0013b if product wants)

---

## References

- Reference PNG: `./assets/app-showcase-reference.png`
- Marquee: [`magicui/marquee.tsx`](../../../apps/website/components/magicui/marquee.tsx)
- Edge fade pattern: [`logo-cloud/LogoCloudSection.tsx`](../../../apps/website/components/containers/logo-cloud/LogoCloudSection.tsx)
- Minister photo list: [`UserSection.tsx`](../../../apps/website/components/containers/UserSection.tsx)
- Dark tokens: [feat-0001](../feat-0001/PRODUCT.md)
