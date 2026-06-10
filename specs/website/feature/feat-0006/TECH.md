# feat-0006: Tech — Logo cloud infinite slider

## Context

See [PRODUCT.md](./PRODUCT.md). **Infinite-slider logo marquee** for `apps/website` homepage using assets in `public/blocks/`.

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Logos](./PRODUCT.md#d2--logo-sources-blocks), [D3 Layout](./PRODUCT.md#d3--layout-desktop--mobile), [D4 Copy](./PRODUCT.md#d4--copy), [D5 Cards](./PRODUCT.md#d5--featured-partner-cards-out-of-v1).

---

## Objective

1. Add reusable **`InfiniteSlider`** and **`ProgressiveBlur`** UI primitives.
2. Add **`LogoCloudSection`** wired to `_data/troott/logo-cloud.ts`.
3. Place section on homepage after `HeroSection`.
4. Retire placeholder `LogoCloud` / fictional `Logos.*` usage for this surface.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Animation | `motion/react` (`motion` ^12 — already installed) |
| Measure | `react-use-measure` (**new dependency**) |
| Images | Native `<img>` + `/* eslint-disable @next/next/no-img-element */` at file top |
| Styling | Tailwind + feat-0001 dark tokens |
| Assets | Static files under `/blocks/*` → `src="/blocks/…"` |

---

## Commands

```bash
# From repo root
pnpm --filter @troott/website add react-use-measure

pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: desktop marquee + edge blur; mobile static grid; reduced-motion; network tab — 11 logo 200s.

---

## Project structure

```text
apps/website/
├── app/page.tsx                              # wire LogoCloudSection after Hero
├── public/blocks/                            # existing assets (no moves)
├── _data/troott/logo-cloud.ts                # NEW — LOGOS array + copy
├── components/
│   ├── ui/
│   │   ├── infinite-slider.tsx               # NEW — client
│   │   ├── progressive-blur.tsx              # NEW — client
│   │   └── LogoCloud.tsx                     # REPLACE or DELETE after migration
│   └── containers/logo-cloud/
│       ├── LogoCloudSection.tsx              # NEW — section shell
│       └── index.ts
```

---

## Data model

```ts
// _data/troott/logo-cloud.ts
export type LogoCloudItem = {
  src: `/blocks/${string}`;
  alt: string;
  invertOnDark?: boolean; // default true for toolkit SVGs/PNGs
};

export type LogoCloudContent = {
  id: 'partners';
  label: string;
  logos: readonly LogoCloudItem[];
};

export const logoCloudContent: LogoCloudContent = {
  id: 'partners',
  label: 'Built with the tools we trust, from idea to production.',
  logos: [
    { src: '/blocks/typescript.svg', alt: 'TypeScript' },
    { src: '/blocks/go.png', alt: 'Go' },
    { src: '/blocks/rust.png', alt: 'Rust' },
    { src: '/blocks/node-js.svg', alt: 'Node.js' },
    { src: '/blocks/react.svg', alt: 'React' },
    { src: '/blocks/tailwind-css.svg', alt: 'Tailwind CSS' },
    { src: '/blocks/canva.svg', alt: 'Canva' },
    { src: '/blocks/figma.svg', alt: 'Figma' },
    { src: '/blocks/notion.svg', alt: 'Notion' },
    { src: '/blocks/mongodb.svg', alt: 'MongoDB' },
    { src: '/blocks/express-js.svg', alt: 'Express' },
  ],
} as const;
```

---

## Components

### `InfiniteSlider` (`components/ui/infinite-slider.tsx`)

| Prop | Default | Notes |
| ---- | ------- | ----- |
| `children` | — | Duplicated internally for seamless loop |
| `gap` | `16` | Logo cloud uses `24` |
| `speed` | `100` | Logo cloud uses `160` |
| `speedOnHover` | — | Logo cloud uses `50` |
| `direction` | `'horizontal'` | |
| `reverse` | `false` | |
| `className` | — | |

Implementation: user-provided reference — `useMotionValue`, `animate` linear loop, `useMeasure` for width, hover speed transition via `isTransitioning` state.

**Reduced motion:** accept optional `respectReducedMotion?: boolean` (default `true`) — when `prefers-reduced-motion: reduce`, render children once without animation wrapper.

### `ProgressiveBlur` (`components/ui/progressive-blur.tsx`)

| Prop | Default | Logo cloud usage |
| ---- | ------- | ---------------- |
| `direction` | `'bottom'` | `'left'` and `'right'` on marquee edges |
| `blurLayers` | `8` | |
| `blurIntensity` | `0.25` | Logo cloud uses `1` |
| `className` | — | `absolute … w-20 h-full pointer-events-none` |

### `LogoCloudSection` (`components/containers/logo-cloud/LogoCloudSection.tsx`)

```tsx
/* eslint-disable @next/next/no-img-element */
'use client';

// Imports: InfiniteSlider, ProgressiveBlur, logoCloudContent, cn if needed
```

**Structure (normative):**

```text
<section id="partners" aria-label="Technology partners and tools" className="bg-background overflow-hidden py-28 md:py-24">
  <div className="group relative m-auto max-w-6xl px-6">
    <div className="flex flex-col md:flex-row md:items-center">
      <div className="md:max-w-44 md:border-r md:pr-6 md:border-border">
        <p className="text-left text-lg md:text-end md:text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="relative py-6 md:w-[calc(100%-11rem)]">
        {/* mobile: flex-wrap grid */}
        {/* desktop: InfiniteSlider + gradient masks + ProgressiveBlur */}
      </div>
    </div>
  </div>
</section>
```

**`LogoImg` helper (inline or sub-component):**

```tsx
function LogoImg({ src, alt, invertOnDark = true }: LogoCloudItem) {
  return (
    <img
      className={cn('mx-auto h-10 w-fit', invertOnDark && 'dark:invert')}
      src={src}
      alt={alt}
      height={40}
      width="auto"
      loading="lazy"
      decoding="async"
    />
  );
}
```

**Desktop edge masks (from reference):**

```tsx
<div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20" />
<div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20" />
```

Use project `bg-gradient-to-r` / `bg-gradient-to-l` if `bg-linear-to-*` utilities are not in Tailwind config — match existing website conventions.

---

## Homepage integration

```tsx
// app/page.tsx
import { LogoCloudSection } from '@/components/containers/logo-cloud';

export default function Home() {
  return (
    <main className="flex flex-col overflow-x-hidden">
      <HeroSection />
      <LogoCloudSection />
      <WhyTroottSection />
      {/* … */}
    </main>
  );
}
```

---

## Boundaries

**Always:**

- Logo `src` values start with `/blocks/` — no relative `./blocks` paths (Next public folder).
- Client boundary on slider/blur/section (`'use client'`).
- Meaningful `alt` on every logo.
- Lazy-load images.

**Ask first:**

- Swapping v1 list for partner logos (`damola-dark`, `nn`, `dml`, `pacepard-pro`).
- Adding featured partner card grid (feat-0006b).
- Using `next/image` instead of `<img>` (requires width/height per asset).

**Never:**

- Reintroduce fictional `Logos.Biosynthesis` etc. for this section.
- Animate marquee on mobile.
- Light-theme-specific assets (feat-0001 dark only).

---

## Implementation tasks

- [ ] **Task 1:** `pnpm --filter @troott/website add react-use-measure`
- [ ] **Task 2:** Add `infinite-slider.tsx` + `progressive-blur.tsx` (from reference; add reduced-motion guard)
- [ ] **Task 3:** Add `_data/troott/logo-cloud.ts`
- [ ] **Task 4:** Add `LogoCloudSection` + `index.ts`
- [ ] **Task 5:** Wire `app/page.tsx` after `HeroSection`
- [ ] **Task 6:** Remove or repoint legacy `components/ui/LogoCloud.tsx`
- [ ] **Task 7:** Visual QA — invert classes on PNG/SVG; edge blur on wide viewports

---

## Testing strategy

| Level | What | How |
| ----- | ---- | --- |
| Manual | Desktop marquee | Chrome ≥1280px — scroll smooth, hover slows |
| Manual | Mobile grid | 375px — no horizontal overflow, no animation |
| Manual | a11y | `prefers-reduced-motion: reduce` — static logos |
| Manual | Assets | DevTools network — 11 `/blocks/*` requests succeed |
| Build | SSR/CSR | `pnpm --filter @troott/website build` |

---

## Current state (baseline)

| Piece | Path | Notes |
| ----- | ---- | ----- |
| Placeholder cloud | `components/ui/LogoCloud.tsx` | Fictional logos; **not on homepage** |
| Blocks assets | `public/blocks/` | 19 files; 11 used in v1 |
| InfiniteSlider | — | **Not present** |
| Homepage | `app/page.tsx` | Hero → Why Troott (no logo strip) |

---

## Success verification checklist

- [ ] PRODUCT success criteria met
- [ ] `react-use-measure` in `apps/website/package.json`
- [ ] No lint errors on new client files
- [ ] `pnpm --filter @troott/website build` passes
