# feat-0007: Tech — FAQ two-column accordion

## Context

See [PRODUCT.md](./PRODUCT.md). Implement a **new** `FaqsSection` — sticky left header + card accordion on `apps/website` homepage (`#faqs`).

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Layout](./PRODUCT.md#d2--layout-desktop-lg), [D3 Accordion](./PRODUCT.md#d3--accordion-behavior), [D4 Pixel spec](./PRODUCT.md#d4--typography--color-pixel-spec), [D5 Mobile](./PRODUCT.md#d5--mobile--lg), [D6 Content](./PRODUCT.md#d6--content-model).

---

## Objective

Implement **`FaqsSection`** (new container) with:

1. Data from `_data/troott/faqs.ts`.
2. Desktop `lg+` two-column grid with **sticky left header**.
3. Right column **card-style** Radix accordion matching [pixel table](./PRODUCT.md#design-reference-measurements--1440px-viewport).
4. Mobile single-column flow.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Accordion | `@radix-ui/react-accordion` — extend [`Accordion.tsx`](../../../apps/website/components/Accordion.tsx) |
| Icons | `@remixicon/react` `RiAddLine` (existing trigger icon) |
| Styling | Tailwind — dark-only tokens ([feat-0001](../feat-0001/PRODUCT.md)) |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: 1440px desktop (sticky header, card spacing), 375px mobile (stacked flow), keyboard accordion, `#faqs` nav link.

---

## Project structure

```text
apps/website/
├── _data/troott/faqs.ts                    # NEW — label, heading, items[]
├── components/containers/
│   └── Faqs.tsx                            # REFACTOR — two-column layout
│       └── faqs/                           # optional split
│           ├── FaqsSection.tsx
│           ├── FaqsAccordion.tsx
│           └── faq-accordion-ui.ts          # card class tokens (optional)
├── components/Accordion.tsx                # REUSE — trigger + content primitives
└── app/page.tsx                            # unchanged import path if keeping Faqs export
```

**Minimum v1:** `_data/troott/faqs.ts` + refactored `Faqs.tsx` (single file OK if < 200 lines).

---

## Data model

```ts
// _data/troott/faqs.ts
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqsContent = {
  label: string;           // "// FAQ"
  heading: string;           // "Questions?"
  headingMuted: string;      // "We've got answers."
  items: FaqItem[];
};

export const faqsContent: FaqsContent = {
  label: '// FAQ',
  heading: 'Questions?',
  headingMuted: "We've got answers.",
  items: [
    { id: 'find-sermons', question: '…', answer: '…' },
    // … 5 items total — migrate from Faqs.tsx
  ],
};
```

---

## Layout implementation

### DOM (desktop)

```text
<section id="faqs" aria-labelledby="faq-heading" class="py-24 sm:py-32 lg:py-40 bg-background">
  <div class="container mx-auto max-w-7xl px-4 md:px-6">
    <div class="lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-12 xl:gap-20">

      <!-- Left: sticky header -->
      <div class="relative hidden lg:block">
        <div class="sticky z-10" style={{ top: 'calc(var(--site-header-height, 4rem) + 1.5rem)' }}>
          <p class="font-mono text-[13px] leading-none text-zinc-500">{label}</p>
          <h2 id="faq-heading" class="mt-5 text-[2.75rem] lg:text-[3.5rem] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span class="block text-white">{heading}</span>
            <span class="block text-zinc-500">{headingMuted}</span>
          </h2>
        </div>
      </div>

      <!-- Mobile header (lg:hidden) -->
      <div class="mb-12 lg:hidden">…same header…</div>

      <!-- Right: accordion cards -->
      <Accordion type="single" collapsible class="flex flex-col gap-3">
        {items.map → FaqAccordionCard}
      </Accordion>

    </div>
  </div>
</section>
```

### Sticky requirements ([PRODUCT R2](./PRODUCT.md#r2--sticky-left-header))

| Rule | Implementation |
| ---- | -------------- |
| Grid must not use `items-start` | Default stretch so left grid cell spans full FAQ height |
| Sticky on inner header wrapper | Outer `relative hidden lg:block`; inner `sticky z-10` |
| Main overflow | Homepage `<main>` must **not** use `overflow-x-hidden` |

---

## Accordion card component

Override default list-style `AccordionItem` borders:

```tsx
<AccordionItem
  value={item.id}
  className="overflow-hidden rounded-lg border border-white/10 bg-[#111111] border-b-0"
>
  <AccordionTrigger className="p-6 text-lg font-medium leading-7 text-white [&>svg]:text-zinc-400">
    {item.question}
  </AccordionTrigger>
  <AccordionContent className="px-6 pb-6 pt-0 text-base leading-[1.6] text-zinc-400">
    <div className="mt-4">{item.answer}</div>
  </AccordionContent>
</AccordionItem>
```

**Trigger padding:** Radix trigger default `py-3` → override to **`p-6`** on trigger; content **`px-6 pb-6`** with **`mt-4`** on answer inner div for **16px** question→answer gap per spec.

**Icon:** Keep [`AccordionTrigger`](../../../apps/website/components/Accordion.tsx) `RiAddLine` + `group-data-[state=open]:rotate-45`.

---

## Pixel QA checklist (@ 1440px)

Use browser devtools on `1280px` container (max-w-7xl):

| Check | Expected |
| ----- | -------- |
| Section `padding-top` | **160px** (`lg:py-40`) |
| Grid `gap` @ xl | **80px** |
| Card `border-radius` | **8px** |
| Card `padding` | **24px** |
| Card stack `gap` | **12px** |
| H2 `font-size` @ lg | **56px** (`3.5rem`) |
| Eyebrow `font-size` | **13px** |
| Question `font-size` | **18px** |
| Answer `font-size` | **16px** |
| Sticky `top` | **88px** (64+24) |

Screenshot diff against `./assets/faq-two-column-reference.png`.

---

## Accessibility

| Requirement | Implementation |
| ----------- | -------------- |
| `aria-labelledby` | `faq-heading` on section |
| Accordion | Radix single collapsible |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-white/40` on trigger (extend AccordionTrigger className) |

---

## Homepage integration

```tsx
// app/page.tsx — no order change
import { Faqs } from '@/components/containers/Faqs';

<Faqs />
<DownloadsSection />
<CTASection />
```

---

## Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Add `_data/troott/faqs.ts` with migrated copy |
| 2 | Refactor `Faqs.tsx` to two-column grid + sticky header |
| 3 | Card-style `AccordionItem` overrides (gap-3 stack) |
| 4 | Mobile header + flow layout (`lg:hidden` / `lg:grid`) |
| 5 | Verify sticky with homepage `<main>` overflow |
| 6 | Pixel QA @ 1440 / 375 |
| 7 | axe + keyboard pass |

---

## Testing

| Type | Coverage |
| ---- | -------- |
| Manual | Desktop sticky header stays visible while scrolling 5 cards |
| Manual | Card dimensions match [pixel spec](./PRODUCT.md#design-reference-measurements--1440px-viewport) |
| Manual | Single-expand accordion; collapse all allowed |
| Manual | `#faqs` from navbar lands on section |
| Manual | Mobile — no sticky, stacked cards |
| Build | `pnpm --filter @troott/website build` |

---

## Rollback

Revert `Faqs.tsx` to pre-feat-0007 centered layout — single-file restore.
