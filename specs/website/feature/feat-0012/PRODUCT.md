# feat-0012: Homepage — Centered story headline + audience tags

## Summary

Add a **new** homepage section: a **center-aligned** block with a large **multi-line headline** that embeds an **inline pill image** and **inline emoji**, a one-line **subtext**, and a horizontal row of **audience hashtag pills**.

**Design reference:** `./assets/centered-story-headline-reference.png` — light band, “Build steady daily [pill photo] habits…”, “Used by people to improve routines.”, `#Founders` `#Students` `#Busy parents` `#Remote teams`.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md) — layout and spacing match reference; colors use Troott dark tokens ([D5](#d5--troott-dark-adaptation)).

**Normative decisions:** [Placement](#d1--section-placement), [Layout](#d2--layout), [Headline inline embeds](#d3--headline-with-inline-embeds), [Subtext & pills](#d4--subtext--audience-pills-pixel-spec), [Dark adaptation](#d5--troott-dark-adaptation), [Content model](#d6--content-model).

**Recommendations:** [R1 Copy](#r1--troott-copy), [R2 Assets](#r2--inline-image-asset), [R3 Homepage stack](#r3--homepage-stack).

---

## Problem

| Today | Gap |
| ----- | --- |
| No **centered narrative** block with inline media on homepage | Reference shows high-impact “who + why” in one scan |
| Benefits / Why Troott use **left-aligned** headers | This pattern is **fully centered** with hashtag audience chips |
| No reusable **headline segment** model (text / image / emoji) | Inline pill + emoji require structured content, not one string |

**Goal:** Pixel-aligned section @ **1440px** with Troott copy; reference layout preserved on dark shell.

---

## Design reference (from `./assets/centered-story-headline-reference.png`)

Reference is a **light gray band** on a marketing page. **Geometry and typography scale below are normative**; reference strings are **not** shipped ([R1](#r1--troott-copy)).

### Reference strings (do not ship)

| Role | Reference text |
| ---- | -------------- |
| Headline | Build steady daily **[pill image]** habits with a layout that keeps your mornings, evenings, **[☀️ emoji]** and focus simple to follow. |
| Subtext | Used by people to improve routines. |
| Pills | `#Founders` · `#Students` · `#Busy parents` · `#Remote teams` |

### ASCII layout (@ desktop ~1440px)

```text
┌ section ─────────────────────────────────────────────────────────────────┐
│                         (band bg — see D5)                               │
│                              py ~120–160px                               │
│                                                                          │
│              max-w ~720px mx-auto text-center                            │
│                                                                          │
│     Build steady daily  ( pill img )  habits with a layout               │
│     that keeps your mornings, evenings,  ( emoji )  and focus            │
│     simple to follow.                                                    │
│                                                                          │
│                    mt ~20px                                              │
│              Used by people to improve routines.                         │
│                                                                          │
│                    mt ~32px                                              │
│         (#Founders)  (#Students)  (#Busy parents)  (#Remote teams)         │
│              gap ~10px between pills, flex-wrap center                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Design reference (measurements @ 1440px viewport)

Reference artboard: **1440 × ~520px** visible region. Values **normative for QA at `md+`** unless ranged.

### Section shell

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section `id` | `audience-story` | `id="audience-story"` |
| Section padding Y | **96px** mobile → **128px** `sm` → **160px** `lg` | `py-24 sm:py-32 lg:py-40` |
| Container | **1280px** max | `container mx-auto max-w-7xl px-4 md:px-6` |
| Content max width | **720px** centered | `mx-auto max-w-[720px] text-center` |

### Headline (H2) — pixel spec

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Element | single `<h2>` with inline children | `id="audience-story-heading"` |
| Font size | **36px** mobile → **48px** `md+` → **56px** `lg` | `text-[2.25rem] md:text-5xl lg:text-[3.5rem]` |
| Font weight | **700** (bold) | `font-bold` |
| Line height | **1.15** | `leading-[1.15]` |
| Letter spacing | **-0.02em** | `tracking-[-0.02em]` |
| Text align | center | `text-center` |
| Color (reference) | `#171717` near-black | Troott: `#ffffff` ([D5](#d5--troott-dark-adaptation)) |
| Word spacing | natural wrap; **3–4 lines** @ 720px | no `text-balance` required v1 |

### Inline pill image (in headline)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Shape | **full pill** (capsule) | `rounded-full overflow-hidden` |
| Height | **40px** mobile → **48px** `md+` | `h-10 md:h-12` |
| Width | **auto** from aspect; target **~96–112px** @ md | `w-[5.5rem] md:w-28` or intrinsic from asset |
| Vertical align | **middle** with text | `inline-block align-middle` |
| Horizontal margin | **6px** each side | `mx-1.5` |
| Object fit | cover | `object-cover` |
| Border | none in reference | optional `ring-1 ring-white/10` on dark |
| Alt | meaningful (e.g. listener on phone) | required on `<Image>` |

```text
… daily  ┌──────── pill ────────┐  habits with …
         │  photo (cover)       │
         └──────────────────────┘
```

### Inline emoji (in headline)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Character | single emoji (reference: sun) | Unicode in data model |
| Size | **1em** relative to headline | `inline align-middle` wrapper |
| Horizontal margin | **4px** each side | `mx-1` |
| Role | decorative | `aria-hidden="true"` on wrapper |

### Subtext

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Element | `<p>` below H2 | `aria-describedby` optional |
| Margin top | **20px** | `mt-5` |
| Font size | **16px** mobile → **18px** `md+` | `text-base md:text-lg` |
| Font weight | **400** | `font-normal` |
| Line height | **1.5** | `leading-normal` |
| Color (reference) | `#737373` (neutral-500) | Troott: `#a1a1aa` (`text-zinc-400`) |

### Audience pills row

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Wrapper | flex row, centered, wrap | `mt-8 flex flex-wrap items-center justify-center gap-2.5 md:gap-3` |
| Margin top from subtext | **32px** | `mt-8` on wrapper |
| Pill height | **~36px** (incl. padding) | `py-2` + line height |
| Pill padding X | **16px** | `px-4` |
| Pill padding Y | **8px** | `py-2` |
| Border radius | **full** | `rounded-full` |
| Pill bg (reference) | `#e5e5e5` light gray | Troott: `#262626` ([D5](#d5--troott-dark-adaptation)) |
| Pill text (reference) | `#404040` | Troott: `#d4d4d8` (`text-zinc-300`) |
| Pill font size | **14px** | `text-sm` |
| Pill font weight | **500** | `font-medium` |
| Pill gap | **10px** mobile → **12px** `md+` | `gap-2.5 md:gap-3` |
| Leading `#` | **included in label string** | e.g. `#Listeners` — not separate element v1 |
| Interaction | static labels v1 | **not** links |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | New **`AudienceStorySection`** on homepage **after `BenefitsSection`**, **before `FeatureHighlightSection`**. |
| **Anchor** | `id="audience-story"` |
| **Why** | Audience / use-case chips follow value-prop grid; precedes deep product mockup block. |
| **Not in v1** | Second instance; `/about` route |

### D2 — Layout

| | Detail |
| --- | ------ |
| **Pattern** | Single centered column — **no** sidebar, **no** grid, **no** CTA button in v1. |
| **Width** | Copy block **`max-w-[720px]`** centered inside `max-w-7xl` container. |
| **Alignment** | All text and pills **center** at all breakpoints. |

### D3 — Headline with inline embeds

| | Detail |
| --- | ------ |
| **Decision** | Headline is an **ordered segment array** — not one HTML string with manual JSX. |
| **Segment types** | `text` \| `image` \| `emoji` |
| **Rendering** | Map segments inside one `<h2>`; `text` segments are plain spans; `image` uses `next/image` in pill wrapper; `emoji` is span with `aria-hidden`. |
| **Line breaks** | Natural wrap from copy + max-width — **no** forced `<br>` in v1 unless QA shows orphan at 720px. |
| **Reject** | Separate H2 + floating image above text (reference requires **inline** pill). |

### D4 — Subtext & audience pills pixel spec

Normative tables: [Subtext](#subtext), [Audience pills row](#audience-pills-row).

### D5 — Troott dark adaptation

Reference screenshot uses a **light band**. Troott marketing is **dark-only** ([feat-0001](../feat-0001/PRODUCT.md)).

| Reference | Troott v1 |
| --------- | --------- |
| Band `#f5f5f5` / off-white | **`bg-background`** or subtle **`bg-[#0a0a0a]`** — same as page shell; optional **`border-y border-white/5`** for separation |
| Headline `#171717` | **`text-white`** |
| Subtext `#737373` | **`text-zinc-400`** |
| Pill bg `#e5e5e5` | **`bg-[#262626]`** |
| Pill text `#404040` | **`text-zinc-300`** |

**Do not** ship a light-gray band on troott.com without explicit feat-0001 exception.

### D6 — Content model

```ts
type HeadlineSegment =
  | { type: 'text'; value: string }
  | { type: 'image'; src: string; alt: string; width?: number; height?: number }
  | { type: 'emoji'; value: string };

type AudienceStoryContent = {
  id: 'audience-story';
  headline: HeadlineSegment[];
  subtext: string;
  audienceTags: string[];  // include # prefix in string
};
```

**v1 pill count:** **4** tags (matches reference). Wrap on narrow viewports.

---

## Recommendations

### R1 — Troott copy

| Field | Suggested value |
| ----- | --------------- |
| Headline segments | `text` "Stay rooted in " · `image` listener/phone pill · `text` " sermons with an app that keeps your ministers, playlists, " · `emoji` "✝️" or "🎧" · `text` " and daily listening simple to follow." |
| `subtext` | Used by listeners to grow in God's Word. |
| `audienceTags` | `#Listeners`, `#Students`, `#Families`, `#Small groups` |

Product may edit strings in `_data/troott/audience-story.ts` only.

### R2 — Inline image asset

| | Recommendation |
| --- | -------------- |
| **Path** | `public/images/audience-story-inline.jpg` (or reuse cropped hero/listener art) |
| **Aspect** | **~2.3:1** landscape pill (e.g. **112×48** display @2x source) |
| **Subject** | Troott listener moment — not reference health app photo |

### R3 — Homepage stack

```text
…
BenefitsSection              ← feat-0008
AudienceStorySection         ← feat-0012 (NEW)
FeatureHighlightSection      ← feat-0010
CoreFeaturesSection
…
```

Update [`specs/website/README.md`](../README.md) when implemented.

---

## Acceptance criteria

### Visual @ 1440px (`md+`)

- [ ] Centered column `max-w-[720px]`; section `py-40` at `lg`
- [ ] H2 **56px** bold, **1.15** line-height, **-0.02em** tracking
- [ ] Inline pill image **48px** tall, `rounded-full`, `align-middle`, **6px** horizontal margin
- [ ] Inline emoji **1em**, `align-middle`, **4px** margin
- [ ] Subtext **18px**, **20px** below headline
- [ ] **4** audience pills, **12px** gap, `rounded-full`, `px-4 py-2`, **14px** medium text
- [ ] Dark palette per [D5](#d5--troott-dark-adaptation)

### Content / a11y

- [ ] Headline segments from `_data/troott/audience-story.ts`
- [ ] Inline image has non-empty `alt`
- [ ] Emoji decorative only (`aria-hidden`)
- [ ] Section `aria-labelledby="audience-story-heading"`

### Build

- [ ] `pnpm --filter @troott/website build`

---

## Out of scope (v1)

- Light-theme band matching reference literally
- Clickable hashtag links / routing
- Animated emoji or image
- Carousel of multiple headlines
- MDX-driven copy

---

## References

- Reference PNG: `./assets/centered-story-headline-reference.png`
- Dark-only policy: [feat-0001](../feat-0001/PRODUCT.md)
- Closest existing header pattern: [feat-0008](../feat-0008/PRODUCT.md) (split H2 — **different** layout; do not reuse component)
