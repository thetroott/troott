# feat-0009: Tech — product surfaces (Exact-style tabs)

## Context

See [PRODUCT.md](./PRODUCT.md). Implement a **new** `WhyTroottSection` — Exact-style horizontal pill tabs, single visual panel, and detail footer on `apps/website` homepage (`#why-troott`).

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Layout](./PRODUCT.md#d2--single-column-layout), [D3 Tabs](./PRODUCT.md#d3--horizontal-pill-tabs), [D4 Visual](./PRODUCT.md#d4--visual-card), [D5 Footer](./PRODUCT.md#d5--detail-footer-row), [D6 Content](./PRODUCT.md#d6--content-model).

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell), [Header](./PRODUCT.md#header-block), [Tab pills](./PRODUCT.md#horizontal-tab-pills), [Visual card](./PRODUCT.md#visual-card), [Footer row](./PRODUCT.md#detail-footer-row), [QA checklist](./PRODUCT.md#measurement-checklist-qa--1440px).

---

## Objective

Implement **`WhyTroottSection`** with:

1. Content from `_data/troott/why-troott.ts` (four tabs).
2. Horizontal text-only pill tabs; **one** active panel at a time.
3. 16:10 visual card + footer row per [PRODUCT pixel spec](./PRODUCT.md#design-reference-measurements--1440px-viewport).
4. `GetTroottButton` + `Newsletter` listener modal for `listen` tab.
5. No scroll-spy, no sidebar nav, no tab icons.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Images | `next/image` — `fill`, `object-cover` |
| Styling | Tailwind — dark-only ([feat-0001](../feat-0001/PRODUCT.md)) |
| CTA | `GetTroottButton` ([feat-0003](../feat-0003/PRODUCT.md)) |
| Analytics | `@vercel/analytics` `track('listenerSignup', …)` on modal open |
| Data | `_data/troott/why-troott.ts` |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA @ **1440px**: measure against [PRODUCT checklist](./PRODUCT.md#measurement-checklist-qa--1440px); tab keyboard nav; reduced-motion tab swap.

---

## Project structure

```text
apps/website/
├── app/page.tsx
├── _data/troott/why-troott.ts                    # content (existing schema)
├── components/containers/why-troott/
│   ├── WhyTroottSection.tsx                     # section shell + tabs + panel
│   ├── useWhyTroottTabs.ts                      # activeTabId + keyboard (optional)
│   └── index.ts
├── components/ui/get-troott-button.tsx          # listen tab CTA
└── components/NewsletterModal.tsx               # listener signup fallback
```

**Do not** use `useWhyTroottScrollspy` or Warp sidebar layout from [feat-0004](../feat-0004/PRODUCT.md).

---

## Data model

Uses existing types in [`why-troott.ts`](../../../apps/website/_data/troott/why-troott.ts):

```ts
export type WhyTroottTabId = 'listen' | 'studio' | 'share' | 'churches';

export type WhyTroottTab = {
  id: WhyTroottTabId;
  navLabel: string;
  eyebrow: string;
  title: string; // unused in v1 UI — eyebrow only in footer
  description: string;
  cta: {
    label: string;
    href?: string;
    external?: boolean;
    useGetTroott?: boolean;
  };
  image: { src: string; alt: string };
};

export type WhyTroottContent = {
  label: string;
  heading: string;
  headingMuted: string;
  defaultTabId: WhyTroottTabId;
  tabs: WhyTroottTab[];
};
```

---

## Components

### `useWhyTroottTabs`

**File:** `components/containers/why-troott/useWhyTroottTabs.ts`

| Responsibility | Detail |
| -------------- | ------ |
| State | `activeTabId`, default `content.defaultTabId` |
| `setActiveTabId` | Called on pill click |
| Keyboard | Optional: ArrowLeft/ArrowRight roving `tabindex` on pills |
| **Exclude** | Scroll listeners, `IntersectionObserver`, `sectionsRef` |

### `WhyTroottSection`

**File:** `components/containers/why-troott/WhyTroottSection.tsx`

Normative tree:

```text
WhyTroottSection
├── section#why-troott[aria-labelledby=why-troott-heading]
│   └── div.container.max-w-7xl
│       ├── header (eyebrow + split h2)
│       ├── nav[aria-label="Why Troott products"]
│       │   └── ul[role=tablist] → button[role=tab] × 4
│       ├── div[role=tabpanel]#why-troott-panel
│       │   └── VisualCard (aspect-[16/10], Image key=tab.id)
│       └── footer row (eyebrow + description + CTA)
└── Newsletter (open state for listen fallback)
```

**Tab segmented control (normative — Exact reference):**

```tsx
// track
<ul role="tablist" className="inline-flex flex-wrap gap-1 rounded-full bg-[#262626] p-1.5">
// active tab (elevated on track)
'… h-9 sm:h-10 rounded-full px-5 bg-[#ececec] text-black shadow-sm';
// inactive tab
'… h-9 sm:h-10 rounded-full px-5 bg-transparent text-white hover:text-white/90';
```

**Footer description:**

```tsx
<p className="max-w-2xl font-matter text-base leading-[1.6] text-white sm:text-lg sm:leading-[1.65]" aria-live="polite">
```

**Visual card:**

```tsx
<div className="relative mb-10 aspect-[16/10] min-h-[320px] w-full overflow-hidden rounded-[20px]">
  <Image
    key={activeTab.id}
    src={activeTab.image.src}
    alt={activeTab.image.alt}
    fill
    className="object-cover"
    sizes="(max-width: 1024px) 100vw, 1232px"
    priority={activeTab.id === 'listen'}
  />
</div>
```

**Footer CTA branch:**

```tsx
{activeTab.cta.useGetTroott ? (
  <GetTroottButton variant="pill" labelMode="full" onFallback={onOpenListener} />
) : (
  <Link href={activeTab.cta.href} … className="inline-flex h-10 … rounded-sm bg-white …">
    {activeTab.cta.label}
  </Link>
)}
```

---

## Homepage integration

```tsx
// app/page.tsx
import { WhyTroottSection } from '@/components/containers/why-troott';

// …
<FeaturedPartnersSection />
<WhyTroottSection />
<BenefitsSection />   {/* feat-0008 */}
<CoreFeaturesSection {...coreFeaturesContent} />
```

---

## Pixel QA checklist (@ 1440px)

| Check | Expected |
| ----- | -------- |
| Section padding Y | 112px (`py-28`) |
| Container width | 1280px max |
| Content width | 1232px |
| H2 size | 56px |
| Tab height | 40px |
| Tab gap | 8px |
| Card radius | 20px |
| Card aspect | 16:10 |
| Description max-width | 448px |
| CTA height | 40px |
| CTA radius | 6px |

Side-by-side with `./assets/exact-use-cases-reference.png`.

---

## Boundaries

**Always:**

- Single active panel; click-to-switch tabs.
- Text-only pills (no icons).
- Tab chrome: `#262626` track + `#ececec` active pill + white inactive labels.
- `rounded-[20px]` visual card, no border.
- Four tabs from `why-troott.ts`.

**Ask first:**

- URL hash tab routing.
- Floating mockup overlay on visual card.
- Replacing `CoreFeaturesSection` (scope expansion).

**Never:**

- Vertical sticky sidebar ([feat-0004](../feat-0004/PRODUCT.md) pattern).
- Scroll-spy stacked sections.
- Teal active states in this section.
- `useWhyTroottScrollspy` in feat-0009 implementation.

---

## Implementation tasks

- [ ] **Task 1:** Add `useWhyTroottTabs.ts` (state only, no scroll-spy)
- [ ] **Task 2:** Implement `WhyTroottSection.tsx` per PRODUCT pixel spec
- [ ] **Task 3:** Export from `why-troott/index.ts`
- [ ] **Task 4:** Wire `app/page.tsx` after `FeaturedPartnersSection`
- [ ] **Task 5:** Copy reference PNG to `./assets/exact-use-cases-reference.png`
- [ ] **Task 6:** Pixel QA @ 1440px against PRODUCT checklist
- [ ] **Task 7:** `pnpm --filter @troott/website build`

---

## Current state (baseline)

| Piece | Path | Notes |
| ----- | ---- | ----- |
| Content | `_data/troott/why-troott.ts` | Exists |
| Section (Warp layout) | `WhyTroottSection.tsx` | Sidebar + scroll-spy — **replace** with feat-0009 implementation |
| Scroll-spy hook | `useWhyTroottScrollspy.ts` | **Remove** from feat-0009 path |
| Icons map | `why-troott-icons.tsx` | Not used in feat-0009 UI |
| Homepage | `app/page.tsx` | `WhyTroottSection` already wired |

---

## Success verification

- [ ] PRODUCT acceptance criteria met
- [ ] Pixel QA table passed @ 1440px
- [ ] Tab keyboard navigation works
- [ ] `listen` → `Newsletter` modal on `GetTroottButton` fallback
- [ ] Build + lint pass
