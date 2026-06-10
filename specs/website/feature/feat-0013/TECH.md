# feat-0013: Tech — App showcase (center phone + tile marquees)

## Context

See [PRODUCT.md](./PRODUCT.md). Implement **`AppShowcaseSection`** on `apps/website`: dual horizontal marquees, center phone, edge fades. **No new dependencies.**

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell), [Marquee rows](./PRODUCT.md#marquee-rows), [Tiles](./PRODUCT.md#tile--photo-card), [Phone](./PRODUCT.md#center-phone), [Masks](./PRODUCT.md#edge-fade-masks).

---

## Objective

1. Add `_data/troott/app-showcase.ts` with phone + two tile rows ([R1](./PRODUCT.md#r1--troott-copy), [R2](./PRODUCT.md#r2--assets-from-appswebsite)).
2. Implement **`AppShowcaseSection`** + **`ShowcaseTile`** + **`ShowcaseMarqueeRow`** under `components/containers/app-showcase/`.
3. Wire homepage after `FeatureHighlightSection`.
4. Pixel QA @ 1440px against `./assets/app-showcase-reference.png`.

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

---

## Project structure

```text
apps/website/
├── _data/troott/app-showcase.ts              # NEW — phone + row tile data
├── components/containers/app-showcase/
│   ├── AppShowcaseSection.tsx                # NEW — section shell + stage
│   ├── ShowcaseMarqueeRow.tsx                # NEW — Marquee + edge masks
│   ├── ShowcaseTile.tsx                      # NEW — photo | action variant
│   └── index.ts
├── components/magicui/marquee.tsx            # REUSE
├── components/ui/progressive-blur.tsx        # REUSE (optional blur on masks)
├── public/blocks/phone-screenshot-appstore.png
├── public/images/*.jpg                       # photo tiles
└── app/page.tsx                              # wire once
```

**Do not** modify `UserSection.tsx`, `FeatureHighlightSection.tsx`, or `logo-cloud/` — copy patterns only.

---

## Data model

```ts
// _data/troott/app-showcase.ts
import type { RemixiconComponentType } from '@remixicon/react';
import {
  RiBookmarkLine,
  RiCompass3Line,
  RiHeadphoneLine,
  RiPlayListAddLine,
  RiShareForwardLine,
  RiTimeLine,
} from '@remixicon/react';

export type ShowcaseAccent = 'cyan' | 'orange' | 'violet' | 'rose' | 'blue';

export type ShowcasePhotoTile = {
  id: string;
  kind: 'photo';
  src: string;
  alt: string;
};

export type ShowcaseActionTile = {
  id: string;
  kind: 'action';
  icon: RemixiconComponentType;
  label: string;
  accent: ShowcaseAccent;
};

export type ShowcaseTile = ShowcasePhotoTile | ShowcaseActionTile;

export type AppShowcaseContent = {
  id: 'app-showcase';
  phone: { src: string; alt: string; width: 272 };
  rows: [
    { id: 'top'; tiles: ShowcaseTile[] },
    { id: 'bottom'; tiles: ShowcaseTile[] },
  ];
};

export const accentClasses: Record<
  ShowcaseAccent,
  { badge: string; glow: string }
> = {
  cyan: { badge: 'bg-cyan-500/20 text-cyan-300', glow: 'shadow-cyan-500/20' },
  blue: { badge: 'bg-blue-500/20 text-blue-300', glow: 'shadow-blue-500/20' },
  orange: { badge: 'bg-orange-500/20 text-orange-300', glow: 'shadow-orange-500/20' },
  violet: { badge: 'bg-violet-500/20 text-violet-300', glow: 'shadow-violet-500/20' },
  rose: { badge: 'bg-rose-500/20 text-rose-300', glow: 'shadow-rose-500/20' },
};
```

Interleave **photo** and **action** tiles per reference rhythm (photo, action, photo, …). Minimum **6** tiles per row before `Marquee` `repeat`.

---

## Components

### `ShowcaseTile`

```tsx
// photo: relative size-[132px] rounded-[20px] overflow-hidden border border-white/10
// action: same shell + flex center column, icon badge size-10, label text-[13px]
```

Use `next/image` with `fill` + `sizes="132px"` for photo tiles.

### `ShowcaseMarqueeRow`

```tsx
'use client';

import { Marquee } from '@/components/magicui/marquee';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

export function ShowcaseMarqueeRow({
  tiles,
  reverse = false,
}: {
  tiles: ShowcaseTile[];
  reverse?: boolean;
}) {
  return (
    <div className="relative">
      <Marquee
        reverse={reverse}
        pauseOnHover
        className="[--duration:45s] [--gap:1rem] motion-reduce:[animation:none]"
        repeat={2}
      >
        {tiles.map((tile) => (
          <ShowcaseTile key={tile.id} tile={tile} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-background" />
      <ProgressiveBlur className="pointer-events-none absolute inset-y-0 left-0 z-20 h-full w-20" direction="left" blurIntensity={1} />
      <ProgressiveBlur className="pointer-events-none absolute inset-y-0 right-0 z-20 h-full w-20" direction="right" blurIntensity={1} />
    </div>
  );
}
```

### `AppShowcaseSection`

Normative tree:

```text
AppShowcaseSection
├── section#app-showcase[aria-label=…]
│   └── div.stage (relative lg:min-h-[560px] overflow-hidden)
│       ├── ShowcaseMarqueeRow (top, reverse=false) — absolute top offset
│       ├── ShowcaseMarqueeRow (bottom, reverse=true) — absolute bottom offset
│       └── div.phone (absolute center z-30)
│           └── Image phone-screenshot-appstore.png w-[272px] h-auto
```

**Stage positioning (normative @ lg):**

```tsx
<div className="relative lg:min-h-[560px]">
  <div className="absolute inset-x-0 top-[calc(50%-156px)]">
    <ShowcaseMarqueeRow tiles={rows[0].tiles} />
  </div>
  <div className="absolute inset-x-0 top-[calc(50%+24px)]">
    <ShowcaseMarqueeRow tiles={rows[1].tiles} reverse />
  </div>
  <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
    <Image … className="w-[272px] h-auto drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]" priority />
  </div>
</div>
```

**Mobile (`< lg`):** stack — optional single static `flex flex-wrap justify-center gap-4` row + phone below; hide second marquee row or show 4 tiles total.

---

## Homepage integration

```tsx
// app/page.tsx
import { AppShowcaseSection } from '@/components/containers/app-showcase';

// …
<FeatureHighlightSection />
<AppShowcaseSection />
<CoreFeaturesSection … />
```

---

## Pixel QA checklist (@ 1440px)

| # | Check | Expected |
| - | ----- | -------- |
| 1 | Tile size | 132 × 132px |
| 2 | Tile radius | 20px |
| 3 | Row gap | 20px between row centers |
| 4 | Phone width | 272px |
| 5 | Edge mask | 128px fade each side |
| 6 | Phone z-index | above tiles |
| 7 | Marquee directions | top LTR, bottom RTL |
| 8 | Reduced motion | no animation |

Side-by-side with `./assets/app-showcase-reference.png` (layout; colors are dark-adapted).

---

## Boundaries

**Always:**

- Reuse existing `Marquee`, `ProgressiveBlur`, `/blocks/*`, `/images/*` assets
- Dark-only shell ([feat-0001](../feat-0001/PRODUCT.md))
- `prefers-reduced-motion` fallback

**Never:**

- Import reference health-app screenshots
- Add npm packages for marquee
- Edit existing homepage sections in place — **new folder only**

**Ask first:**

- Headline copy above stage
- Click-through links on tiles

---

## Implementation tasks

- [ ] **Task 1:** `_data/troott/app-showcase.ts`
- [ ] **Task 2:** `ShowcaseTile`, `ShowcaseMarqueeRow`, `AppShowcaseSection`, `index.ts`
- [ ] **Task 3:** Wire `app/page.tsx`
- [ ] **Task 4:** Pixel QA + build

---

## Current state

| Piece | Status |
| ----- | ------ |
| Spec | **feat-0013** (this doc) |
| `AppShowcaseSection` | **Not implemented** |
| Reference asset | `./assets/app-showcase-reference.png` |
| Center phone asset | `public/blocks/phone-screenshot-appstore.png` **exists** |
| Marquee primitive | `components/magicui/marquee.tsx` **exists** |
