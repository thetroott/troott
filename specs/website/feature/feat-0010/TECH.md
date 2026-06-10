# feat-0010: Tech — Feature highlight (Mockup + rise)

## Context

See [PRODUCT.md](./PRODUCT.md). **Launch UI mobile mockup** with **hover rise** on `apps/website`.

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell-outer), [Inner panel](./PRODUCT.md#inner-panel-rounded-card), [Left column](./PRODUCT.md#left-column--pixel-spec), [Mockup column](./PRODUCT.md#right-column--mockup--rise-interaction).

---

## Objective

1. Install [Launch UI Mockup](https://www.launchuicomponents.com/docs/components/mockup) + [Screenshot](https://www.launchuicomponents.com/docs/components/screenshot).
2. Implement **`FeatureHighlightSection`** + **`FeatureHighlightPanel`** from `_data/troott/feature-highlight.ts`.
3. Wire homepage after `BenefitsSection`.
4. Verify rise interaction + pixel QA @ 1440px.

---

## Prerequisites

| Item | Status |
| ---- | ------ |
| `apps/website/components.json` | exists (shadcn **new-york**) |
| `Mockup` / `Screenshot` in repo | **missing** — install Task 1 |
| Troott mobile screenshot | **`public/images/troott-mobile-app.png`** — add before merge |

---

## Commands

```bash
cd apps/website

# Task 1 — Launch UI (official registry)
npx shadcn@latest add @launchui/mockup
npx shadcn@latest add @launchui/screenshot

pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

---

## Project structure

```text
apps/website/
├── public/images/troott-mobile-app.png     # NEW — Troott UI screenshot
├── _data/troott/feature-highlight.ts       # NEW
├── components/
│   ├── ui/
│   │   ├── mockup.tsx                      # added by shadcn @launchui/mockup
│   │   └── screenshot.tsx                  # added by shadcn @launchui/screenshot
│   └── containers/feature-highlight/
│       ├── FeatureHighlightSection.tsx     # NEW — section + panel + group
│       ├── FeatureHighlightBullets.tsx     # NEW — check list
│       └── index.ts
└── app/page.tsx                            # wire after BenefitsSection
```

---

## Data model

```ts
// _data/troott/feature-highlight.ts
export type FeatureHighlightContent = {
  id: 'feature-highlight';
  eyebrow: string;
  heading: string;
  description: string;
  bullets: readonly string[];
  screenshot: {
    src: string;
    alt: string;
    width: 175;
    height: 380;
  };
};

export const featureHighlightContent: FeatureHighlightContent = {
  id: 'feature-highlight',
  eyebrow: 'Personalized listening',
  heading: 'Built around you, from day one',
  description:
    'Follow the ministers you trust, save sermons, and pick up where you left off — so every recommendation feels made for you.',
  bullets: [
    'Tailored listening profile',
    'Tracks progress across sermons',
    'Gets smarter every session',
  ],
  screenshot: {
    src: '/images/troott-mobile-app.png',
    alt: 'Troott mobile app',
    width: 175,
    height: 380,
  },
} as const;
```

Copy defaults from [PRODUCT R1](./PRODUCT.md#r1--troott-copy); adjust in data file only.

---

## Components

### `FeatureHighlightBullets`

```tsx
import { Check } from 'lucide-react';

export function FeatureHighlightBullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-8 flex flex-col gap-4">
      {items.map((text) => (
        <li key={text} className="flex items-start gap-3">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#262626]"
            aria-hidden
          >
            <Check className="size-3 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-base leading-normal text-zinc-400">{text}</span>
        </li>
      ))}
    </ul>
  );
}
```

### Mockup + rise wrapper (normative)

```tsx
'use client';

import { Mockup } from '@/components/ui/mockup';
import { Screenshot } from '@/components/ui/screenshot';
import { cx } from '@/lib/utils';

import type { FeatureHighlightContent } from '@/_data/troott/feature-highlight';

export function FeatureHighlightMockup({
  screenshot,
}: {
  screenshot: FeatureHighlightContent['screenshot'];
}) {
  return (
    <div className="flex items-end justify-center overflow-hidden lg:h-full">
      <div
        className={cx(
          'translate-y-6 transition-transform duration-500 ease-out',
          'lg:translate-y-10 lg:group-hover:translate-y-4',
          'motion-reduce:translate-y-0 motion-reduce:transition-none',
        )}
      >
        <Mockup type="mobile">
          <Screenshot
            srcLight={screenshot.src}
            srcDark={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
          />
        </Mockup>
      </div>
    </div>
  );
}
```

**Requires** `group` class on panel ancestor (see below). Use Tailwind `motion-reduce:` variants if configured; else `prefers-reduced-motion` media in CSS module.

### `FeatureHighlightSection`

```tsx
import { featureHighlightContent } from '@/_data/troott/feature-highlight';

import { FeatureHighlightBullets } from './FeatureHighlightBullets';
import { FeatureHighlightMockup } from './FeatureHighlightMockup';

export function FeatureHighlightSection() {
  const { id, eyebrow, heading, description, bullets, screenshot } =
    featureHighlightContent;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="bg-background py-20 lg:py-28"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div
          className={cx(
            'group overflow-hidden rounded-[40px] bg-[#0a0a0a]',
            'lg:min-h-[480px] lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]',
          )}
        >
          <div className="p-10 lg:p-14">
            <p className="text-sm text-zinc-500">{eyebrow}</p>
            <h2
              id={`${id}-heading`}
              className="mt-4 max-w-[26rem] text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white lg:text-[3rem]"
            >
              {heading}
            </h2>
            <p className="mt-5 max-w-[26rem] text-base leading-[1.65] text-zinc-400 lg:text-lg">
              {description}
            </p>
            <FeatureHighlightBullets items={bullets} />
          </div>

          <FeatureHighlightMockup screenshot={screenshot} />
        </div>
      </div>
    </section>
  );
}
```

Add `import { cx } from '@/lib/utils'` in section file.

---

## Homepage integration

```tsx
import { FeatureHighlightSection } from '@/components/containers/feature-highlight';

// …
<BenefitsSection />
<FeatureHighlightSection />
<CoreFeaturesSection {...coreFeaturesContent} />
```

---

## Pixel QA checklist (@ 1440px)

| # | Check | Expected |
| - | ----- | -------- |
| 1 | Panel radius | 40px |
| 2 | Panel min-height | 480px |
| 3 | H2 size | 48px |
| 4 | Body size | 18px |
| 5 | Screenshot display size | 175×380 |
| 6 | Default mockup | bottom clipped |
| 7 | Panel hover | mockup moves up 24px |
| 8 | Reduced motion | no movement |

Side-by-side with `./assets/feature-highlight-reference.png`.

---

## Boundaries

**Always:**

- Use **installed** Launch UI components — do not recreate phone frame by hand unless install blocked.
- `Screenshot` **175×380** unless Launch UI mobile docs change.
- `group` + `group-hover` rise on **panel**, not document body.
- Dark-only: identical `srcLight` / `srcDark`.

**Never:**

- Ship reference health-app screenshot as production asset.
- Use feat-0008 mono `//` eyebrow in this section.
- Animate rise when `prefers-reduced-motion: reduce`.

**Ask first:**

- Adding CTA button to left column.
- Auto-animate rise on scroll (not in reference).

---

## Implementation tasks

- [ ] **Task 1:** `npx shadcn@latest add @launchui/mockup` + `@launchui/screenshot`
- [ ] **Task 2:** Add `public/images/troott-mobile-app.png`
- [ ] **Task 3:** `_data/troott/feature-highlight.ts`
- [ ] **Task 4:** `FeatureHighlightSection`, bullets, mockup wrapper, `index.ts`
- [ ] **Task 5:** Wire `app/page.tsx`
- [ ] **Task 6:** Copy reference PNG to `./assets/feature-highlight-reference.png`
- [ ] **Task 7:** Pixel QA + build

---

## Current state

| Piece | Path | Notes |
| ----- | ---- | ----- |
| Mockup / Screenshot | — | **Not installed** |
| Split demo | `split-demo/SplitDemoSection.tsx` | Different pattern |
| Mobile image | `public/images/hero-mockup.png` | Not Troott in-app UI; do not reuse without crop |

---

## Troubleshooting

| Issue | Action |
| ----- | ------ |
| shadcn add fails | Follow [Launch UI installation guide](https://www.launchuicomponents.com/docs/components/mockup); ensure `components.json` in `apps/website` |
| Screenshot layout shift | Keep `width` / `height` on `Screenshot` per docs |
| Rise not visible | Confirm panel `overflow-hidden` + default `translate-y-10` |
