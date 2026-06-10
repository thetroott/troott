# feat-0011: Tech — vertical tabs + single visual panel

## Context

See [PRODUCT.md](./PRODUCT.md). Implement **`ProductWorkflowsSection`** — Warp Terminal-style vertical tabs with expanded active card and single right-hand visual on `apps/website`.

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Layout](./PRODUCT.md#d2--two-column-desktop-layout), [D3 Header](./PRODUCT.md#d3--section-header), [D4 Tabs](./PRODUCT.md#d4--vertical-tab-list), [D5 Visual](./PRODUCT.md#d5--visual-panel), [D6 Content](./PRODUCT.md#d6--content-model), [D7 Mobile](./PRODUCT.md#d7--mobile-layout).

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell), [Header](./PRODUCT.md#header-block), [Vertical tabs](./PRODUCT.md#vertical-tab-list), [Visual panel](./PRODUCT.md#visual-panel-right-column), [QA checklist](./PRODUCT.md#measurement-checklist-qa--1440px).

---

## Objective

1. New section component with vertical tab list + single `tabpanel` image.
2. Content from `_data/troott/why-troott.ts` (extend with optional `subtitle` on section root).
3. Active tab: `#161616` card, `bg-violet-500` 2px top accent, title + description.
4. Inactive tabs: title only, muted.
5. Mobile: horizontal scroll chips per [PRODUCT mobile spec](./PRODUCT.md#mobile--lg).
6. No scroll-spy, no feat-0009 horizontal pills, no notification overlays.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| State | `useState<WhyTroottTabId>` for `activeTabId` |
| Images | `next/image` — `fill`, `object-cover` |
| Styling | Tailwind — dark-only ([feat-0001](../feat-0001/PRODUCT.md)) |
| Data | `_data/troott/why-troott.ts` (+ optional `subtitle` field) |
| A11y | WAI-ARIA tabs pattern (`tablist` / `tab` / `tabpanel`) |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA @ **1440px**: [PRODUCT checklist](./PRODUCT.md#measurement-checklist-qa--1440px); tab keyboard nav; reduced-motion instant swap.

---

## Project structure

```text
apps/website/
├── app/page.tsx
├── _data/troott/why-troott.ts                    # extend WhyTroottContent.subtitle (optional)
├── components/containers/product-workflows/
│   ├── ProductWorkflowsSection.tsx              # section shell + tabs + panel
│   ├── VerticalTabList.tsx                        # optional split — tab buttons + active card
│   ├── useProductWorkflowsTabs.ts                 # activeTabId + arrow-key handler (optional)
│   └── index.ts
└── public/images/                                 # per-tab screenshots (existing paths in data)
```

**Do not** reuse:

- `useWhyTroottScrollspy` ([feat-0004](../feat-0004/PRODUCT.md))
- `WhyTroottTabsSection` horizontal pill markup ([feat-0009](../feat-0009/PRODUCT.md))

---

## Data model

Extend section content (backward-compatible):

```ts
// _data/troott/why-troott.ts
export type WhyTroottContent = {
  label: string;
  heading: string;
  headingMuted?: string;       // unused in feat-0011 UI — single-line H2 preferred
  subtitle?: string;             // NEW — supporting line under H2
  defaultTabId: WhyTroottTabId;
  tabs: WhyTroottTab[];
};
```

**feat-0011 field usage:**

| Field | UI placement |
| ----- | ------------ |
| `label` | Section eyebrow (uppercase) |
| `heading` | `h2` — prefer single headline; ignore `headingMuted` or concatenate per product |
| `subtitle` | Paragraph under `h2` |
| `tabs[].navLabel` | Tab title (inactive + active) |
| `tabs[].description` | Active tab card body only |
| `tabs[].image` | Right `tabpanel` `next/image` |

**Unused in feat-0011 v1:** `icon`, `eyebrow`, `title`, `cta` (no CTA row in this layout).

Suggested `subtitle` copy — see [PRODUCT R1](./PRODUCT.md#r1--troott-copy).

---

## Component API

```tsx
// components/containers/product-workflows/ProductWorkflowsSection.tsx
export function ProductWorkflowsSection() {
  // content from whyTroottContent or dedicated productWorkflowsContent
}
```

### Desktop tab button (inactive)

```tsx
<button
  type="button"
  role="tab"
  id={`tab-${tab.id}`}
  aria-selected={isActive}
  aria-controls={`panel-${tab.id}`}
  tabIndex={isActive ? 0 : -1}
  className="w-full py-5 text-left text-base font-medium text-zinc-600 hover:text-zinc-400 lg:text-lg"
>
  {tab.navLabel}
</button>
```

### Desktop tab button (active)

```tsx
<li className="my-2 border-b border-white/10">
  <button ... className="relative w-full rounded-lg bg-[#161616] p-6 text-left">
    <span
      className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-violet-500"
      aria-hidden
    />
    <span className="mb-3 block text-lg font-semibold text-white lg:text-xl">
      {tab.navLabel}
    </span>
    <p className="text-sm leading-[1.65] text-zinc-400 lg:text-[15px]">
      {tab.description}
    </p>
  </button>
</li>
```

### Tab panel

```tsx
<div
  role="tabpanel"
  id={`panel-${activeTab.id}`}
  aria-labelledby={`tab-${activeTab.id}`}
  className="relative aspect-[16/10] min-h-[320px] overflow-hidden rounded-2xl"
>
  <Image
    key={activeTab.id}
    src={activeTab.image.src}
    alt={activeTab.image.alt}
    fill
    className="object-cover transition-opacity duration-200"
    sizes="(max-width: 1024px) 100vw, 58vw"
    priority={activeTab.id === 'listen'}
  />
</div>
```

### Keyboard (normative)

| Key | Action |
| --- | ------ |
| `ArrowDown` / `ArrowUp` | Move focus between tabs; update `activeTabId` |
| `Home` / `End` | First / last tab |
| `Enter` / `Space` | Activate focused tab (if using roving `tabIndex`) |

Implement in `useProductWorkflowsTabs` or inline — match [feat-0009 TECH](../feat-0009/TECH.md) keyboard section pattern.

---

## Layout markup skeleton

```tsx
<section id="product-workflows" aria-labelledby="product-workflows-heading" className="bg-background py-20 sm:py-28">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
    {/* Header */}
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">{content.label}</p>
    <h2 id="product-workflows-heading" className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white lg:text-[2.75rem]">
      {content.heading}
    </h2>
    {content.subtitle ? (
      <p className="mt-3 max-w-2xl text-base leading-[1.6] text-zinc-400 lg:text-lg">{content.subtitle}</p>
    ) : null}
    <div className="mt-8 h-px w-full bg-white/10" />
    {/* Grid */}
    <div className="mt-8 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start lg:gap-12 xl:gap-16">
      <VerticalTabList ... />
      <TabPanelVisual tab={activeTab} />
    </div>
  </div>
</section>
```

---

## Mobile implementation

| Breakpoint | Behavior |
| ---------- | -------- |
| `< lg` | Hide vertical `tablist`; show horizontal `overflow-x-auto` chip row |
| Active chip | `border-t-2 border-violet-500 bg-[#161616] text-white` |
| Description | Single paragraph between chips and image for active tab |
| Visual | Same 16:10 card, full width |

---

## Tasks

### Task 1 — Data

- [ ] Add optional `subtitle` to `WhyTroottContent` + populate Troott copy
- **Verify:** TypeScript compiles; existing consumers unaffected

### Task 2 — `ProductWorkflowsSection`

- [ ] Section shell + header + divider per [PRODUCT](./PRODUCT.md#header-block)
- [ ] Vertical tab list + active card styling
- [ ] Single image panel with tab swap
- **Verify:** `pnpm dev:website` @ 1440px vs reference PNG

### Task 3 — Keyboard + a11y

- [ ] `tablist` / `tab` / `tabpanel` wiring
- [ ] Arrow key navigation
- **Verify:** VoiceOver / keyboard-only tab change

### Task 4 — Mobile chips

- [ ] Horizontal scroll chips + mobile description
- **Verify:** 390px viewport — no horizontal page overflow

### Task 5 — Homepage wire-up

- [ ] Import in `app/page.tsx` per approved [R4 stack](./PRODUCT.md#r4--homepage-stack)
- [ ] Update `specs/website/README.md`
- **Verify:** `pnpm --filter @troott/website build`

---

## Boundaries

| Always | Ask first |
| ------ | --------- |
| Follow [PRODUCT](./PRODUCT.md) pixel tables | Replace `WhyTroottTabsSection` or `WhyTroottSection` on homepage |
| Reuse `why-troott.ts` tab ids | Change violet accent to brand teal |
| `prefers-reduced-motion` instant swap | Add notification-card overlay |
| Dark-only images | New shadcn / Launch UI dependencies |

---

## References

- [PRODUCT.md](./PRODUCT.md)
- Reference: `./assets/warp-vertical-tabs-reference.png`
- [feat-0004](../feat-0004/PRODUCT.md), [feat-0009](../feat-0009/PRODUCT.md)
