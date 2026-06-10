# feat-0008: Tech — Benefits 3×2 grid

## Context

See [PRODUCT.md](./PRODUCT.md). Implement a **new** `BenefitsSection` — Warp-style 3×2 benefits grid on `apps/website` homepage (`#benefits`).

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Grid](./PRODUCT.md#d2--grid-layout), [D3 Cards](./PRODUCT.md#d3--card-chrome-pixel-spec), [D4 Header](./PRODUCT.md#d4--header-pixel-spec), [D5 Icons](./PRODUCT.md#d5--icons), [D6 Content](./PRODUCT.md#d6--content-model-troott-v1).

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell), [Header](./PRODUCT.md#header-block-above-grid), [Grid](./PRODUCT.md#benefits-grid), [Card](./PRODUCT.md#benefit-card-each-cell).

---

## Objective

Implement **`BenefitsSection`** with **`BenefitCard`** tiles, content from `_data/troott/benefits.ts`, and homepage placement after `WhyTroottSection`.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Icons | `@remixicon/react` — `*Line` only |
| Styling | Tailwind — dark-only ([feat-0001](../feat-0001/PRODUCT.md)) |
| Data | `_data/troott/benefits.ts` |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA @ **1440px**: measure against [PRODUCT pixel tables](./PRODUCT.md#design-reference-measurements--1440px-viewport).

---

## Project structure

```text
apps/website/
├── app/page.tsx
├── _data/troott/benefits.ts              # NEW
├── components/containers/benefits/
│   ├── BenefitsSection.tsx               # NEW — section shell + header
│   ├── BenefitCard.tsx                   # NEW — single card
│   ├── benefit-icons.tsx                 # NEW — icon map by id
│   └── index.ts
```

**Do not** extend legacy `components/ui/Benefits.tsx`.

---

## Data model

```ts
// _data/troott/benefits.ts
import type { BenefitIconId } from '@/components/containers/benefits/benefit-icons';

export type BenefitItem = {
  id: string;
  icon: BenefitIconId;
  title: string;
  description: string;
};

export type BenefitsContent = {
  label: string;
  heading: string;
  headingMuted: string;
  items: readonly BenefitItem[];
};

export const benefitsContent: BenefitsContent = {
  label: '// Benefits',
  heading: 'Listen anywhere.',
  headingMuted: 'Share with confidence.',
  items: [
    {
      id: 'library',
      icon: 'book',
      title: 'Every sermon in one place',
      description:
        'Find teachings from ministers you follow — organized, searchable, always available.',
    },
    // … 5 more per PRODUCT R2
  ],
} as const;
```

```ts
// components/containers/benefits/benefit-icons.tsx
import {
  RiBookOpenLine,
  RiFlashlightLine,
  RiHeadphoneLine,
  RiLockLine,
  RiShareForwardLine,
  RiSmartphoneLine,
} from '@remixicon/react';

export type BenefitIconId =
  | 'book'
  | 'everywhere'
  | 'private'
  | 'instant'
  | 'background'
  | 'share';

export const benefitIcons: Record<
  BenefitIconId,
  typeof RiBookOpenLine
> = {
  book: RiBookOpenLine,
  everywhere: RiSmartphoneLine,
  private: RiLockLine,
  instant: RiFlashlightLine,
  background: RiHeadphoneLine,
  share: RiShareForwardLine,
};
```

---

## Components

### `BenefitCard`

**File:** `components/containers/benefits/BenefitCard.tsx`

```tsx
export function BenefitCard({ item }: { item: BenefitItem }) {
  const Icon = benefitIcons[item.icon];
  return (
    <article className="rounded-xl bg-[#111111] p-8 text-left">
      <div
        className="flex size-10 items-center justify-center rounded-full border border-white/[0.08] bg-black"
        aria-hidden
      >
        <Icon className="size-5 text-white" />
      </div>
      <h3 className="mt-6 text-lg font-semibold leading-7 text-white">
        {item.title}
      </h3>
      <p className="mt-2 text-[15px] font-normal leading-[1.6] text-zinc-400">
        {item.description}
      </p>
    </article>
  );
}
```

### `BenefitsSection`

**File:** `components/containers/benefits/BenefitsSection.tsx`

Normative structure:

```tsx
<section
  id="benefits"
  aria-labelledby="benefits-heading"
  className="bg-black py-20 sm:py-24 lg:py-28"
>
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
    <p className="font-mono text-[13px] leading-none text-zinc-500">
      {label}
    </p>
    <h2
      id="benefits-heading"
      className="mt-5 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] lg:text-[2.75rem]"
    >
      <span className="block text-white">{heading}</span>
      <span className="block text-zinc-500">{headingMuted}</span>
    </h2>

    <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <BenefitCard item={item} />
        </li>
      ))}
    </ul>
  </div>
</section>
```

Use `<ul>` / `<li>` for grid semantics; card remains `<article>` inside `<li>`.

---

## Homepage integration

```tsx
// app/page.tsx
import { BenefitsSection } from '@/components/containers/benefits';

// …
<WhyTroottSection />
<BenefitsSection />
<CoreFeaturesSection {...coreFeaturesContent} />
```

---

## Pixel QA checklist (@ 1440px)

| Check | Expected |
| ----- | -------- |
| Section vertical padding | 112px (`py-28`) |
| Container width | 1280px max (`max-w-7xl`) |
| H2 font size | 44px (`text-[2.75rem]`) |
| Grid columns | 3 |
| Grid gap | 24px (`gap-6`) |
| Card background | `#111111` |
| Card radius | 12px (`rounded-xl`) |
| Card padding | 32px (`p-8`) |
| Icon circle | 40px |
| Icon glyph | 20px line white |
| Title | 18px semibold |
| Description | 15px zinc-400 |

Use browser devtools ruler on reference `./assets/warp-benefits-reference.png` side-by-side.

---

## Boundaries

**Always:**

- Exactly **6** cards.
- Line icons only (`*Line`).
- Left-aligned card content.
- `bg-black` section shell (not `bg-background` if token differs from `#000`).

**Ask first:**

- Card hover states.
- Links inside cards.
- Replacing `CoreFeaturesSection` with benefits (scope expansion).

**Never:**

- Wire legacy `components/ui/Benefits.tsx` to homepage.
- Use filled Remix icons (`*Fill`) in icon badge.
- Center-align section header or card text.

---

## Implementation tasks

- [ ] **Task 1:** Add `_data/troott/benefits.ts` (6 items per PRODUCT R2)
- [ ] **Task 2:** Add `benefit-icons.tsx`, `BenefitCard.tsx`, `BenefitsSection.tsx`, `index.ts`
- [ ] **Task 3:** Wire `app/page.tsx` after `WhyTroottSection`
- [ ] **Task 4:** Copy reference PNG to `./assets/warp-benefits-reference.png`
- [ ] **Task 5:** Pixel QA @ 1440px against PRODUCT tables
- [ ] **Task 6:** `pnpm --filter @troott/website build`

---

## Current state (baseline)

| Piece | Path | Notes |
| ----- | ---- | ----- |
| Legacy benefits | `components/ui/Benefits.tsx` | Careers copy; **not on homepage** |
| Homepage | `app/page.tsx` | No benefits grid |
| Why Troott header | `why-troott.ts` | Reuse split-headline pattern |

---

## Success verification

- [ ] PRODUCT acceptance criteria met
- [ ] Pixel QA table passed @ 1440px
- [ ] Build + lint pass
