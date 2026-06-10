# feat-0004: Tech — “Why Troott” tabbed product showcase

## Context

See [PRODUCT.md](./PRODUCT.md). Warp-style **vertical tabs + detail panel** for `apps/website` homepage.

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Tabs](./PRODUCT.md#d2--tab-content-model-v1), [D3 Click/mobile](./PRODUCT.md#d3--click-keyboard--mobile), [D4 Scroll](./PRODUCT.md#d4--scroll-driven-interaction-desktop-lg), [D5 Visuals](./PRODUCT.md#d5--visual-fidelity-vs-warp-reference).

**Recommendations:** [TR1 Scroll engine](#tr1--scroll-engine), [TR2 Pin math](#tr2--pin-release--scroll-height), [TR3 Navbar offset](#tr3--navbar-offset), [TR4 Tabs & accordion](#tr4--radix-tabs--accordion), [TR5 a11y](#tr5--accessibility), [TR6 SSR & hydration](#tr6--ssr--hydration), [TR7 Images](#tr7--images--performance), [TR8 Resize & tablet](#tr8--resize--tablet-breakpoints), [TR9 Conflicts](#tr9--scroll-conflicts-on-homepage).

---

## Objective

Implement **`WhyTroottSection`** — **scrollspy / sticky table of contents** on desktop (`lg+`): sticky left nav, stacked content sections, `IntersectionObserver` active sync, smooth scroll on nav click; **stacked flow on mobile** — with data from `_data` and accessible landmarks.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Language | TypeScript |
| Styling | Tailwind + existing design tokens (feat-0001) |
| Icons | `@remixicon/react` or `lucide-react` (match navbar) |
| Images | `next/image` from `/public/images/...` |
| Scroll / nav sync | **`IntersectionObserver`** on stacked section nodes + **`position: sticky`** nav (see [TR1](#tr1--scroll-engine)) |
| Tabs a11y | `@radix-ui/react-tabs` **already installed** (`^1.1.12`) — see [TR4](#tr4--radix-tabs--accordion) |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: desktop scroll through all four steps; click nav jumps to section; reverse scroll; mobile stacked flow; `prefers-reduced-motion`; keyboard-only.

---

## Project structure

```text
apps/website/
├── app/page.tsx                              # WhyTroottSection replaces CoreFeaturesSection
├── _data/troott/why-troott.ts                # NEW — section header + tab items
├── components/containers/
│   └── why-troott/
│       ├── WhyTroottSection.tsx              # NEW — sticky wrapper + scroll height
│       ├── useWhyTroottScrollspy.ts            # IntersectionObserver ↔ activeTabId + scrollToSection
│       ├── WhyTroottSection.tsx                # sticky nav + stacked sections (desktop); stacked flow (mobile)
│       ├── types.ts
│       └── index.ts
└── components/containers/feature-showcase/   # KEEP for now; unused on homepage v1
```

**Migration:** `app/page.tsx` swaps import; `core-features.ts` may remain for reference or be deleted after `why-troott.ts` lands (prefer single source — delete `core-features.ts` if nothing else imports it).

---

## Data model

```ts
// _data/troott/why-troott.ts
export type WhyTroottTabId = 'listen' | 'studio' | 'share' | 'churches';

export type WhyTroottTab = {
  id: WhyTroottTabId;
  navLabel: string;
  icon: RemixiconComponent; // or icon name string resolved in component
  eyebrow: string;           // panel sub-label (often matches navLabel)
  title: string;
  description: string;
  cta: { label: string; href: string; external?: boolean };
  image: { src: string; alt: string };
};

export type WhyTroottContent = {
  label: string;           // "WHY TROOTT"
  heading: string;         // line 1
  headingMuted: string;    // line 2 (zinc-500)
  defaultTabId: WhyTroottTabId;
  tabs: WhyTroottTab[];
};
```

**v1 image mapping (reuse existing public assets):**

| Tab | Suggested `src` |
| --- | --------------- |
| `listen` | `/images/troott-hero-image.png` |
| `studio` | `/images/website-prop.png` |
| `share` | `/images/hero-mockup.png` |
| `churches` | `/images/troott-hero-image.png` or new asset when available |

Replace with dedicated screenshots when design exports land (update `_data` only).

---

## Recommendations (binding unless overridden)

### TR1 — Scroll engine (scrollspy)

| | Recommendation |
| --- | -------------- |
| **Choice** | **`IntersectionObserver`** on **stacked `<section>` nodes** (`data-section-id`) — same pattern as blog / legal long-form pages. **Not** Framer `useScroll`; **not** `100vh` sentinel steps. |
| **Why** | Natural reading flow; all content visible; nav stays oriented without artificial scroll height or single-panel swapping. |
| **Section placement** | One `<section id="why-troott-{tabId}">` per tab in the right column; `scroll-mt-[calc(var(--site-header-height)+1.5rem)]` for anchor offset. |
| **Activation line** | Section becomes active when the **reading line** (`headerOffset + min(20vh, 160px)`) falls inside that section's bounds. Fallback: section with the most visible area below the header. |
| **rootMargin** | Scroll listener + `getBoundingClientRect()` — no IO `rootMargin` (px/percent only). |
| **Programmatic scroll guard** | After `scrollToSection`, set `isScrollingRef = true` for **500ms**; ignore IO callbacks while true. |
| **Direction** | On overlapping sections, prefer section with **smallest `boundingClientRect.top`** (topmost visible section). |
| **Nav click** | `<a href="#why-troott-{id}">` + `preventDefault` + `element.scrollIntoView({ block: 'start' })`. |

### TR2 — Layout height & sticky nav

| | Recommendation |
| --- | -------------- |
| **Section height** | **Auto** — natural sum of four stacked blocks (`gap-24` / `gap-32`). **No** `tabs.length * 100vh` track. |
| **Sticky nav** | Left `<aside>` with `sticky top-[calc(var(--site-header-height)+1.5rem)] self-start z-10`. Grid must **not** use `items-start` — that shrinks the nav column and breaks sticky. |
| **Page overflow** | Homepage `<main>` uses `overflow-x-clip` (not `overflow-x-hidden`) — hidden overflow on an ancestor disables sticky. |
| **Pin scope** | Only the **nav rail** is sticky; content scrolls normally with the page. |
| **Release** | After last section, user scrolls into next homepage block (`PreText`) with no pin teardown. |

### TR3 — Navbar offset

Implement [PRODUCT R4](./PRODUCT.md#r4--sticky-nav--navbar-offset):

```tsx
// Sticky nav rail
<nav className="sticky top-[calc(var(--site-header-height,4rem)+1.5rem)] self-start">

// Section anchor offset
<section className="scroll-mt-[calc(var(--site-header-height,4rem)+1.5rem)]">
```

Set `--site-header-height: 4rem` in `globals.css` next to existing dark tokens. Measure navbar once in QA; adjust to `4.5rem` only if logo row wraps.

### TR4 — Nav & accordion

| Surface | Package | Pattern |
| ------- | ------- | ------- |
| Desktop `lg+` | Native `<nav>` + anchor links | `aria-current="true"` on active item; `useWhyTroottScrollspy` for IO + click scroll |
| Mobile `< lg` | Stacked sections only — no accordion, no scrollspy nav |

**Breakpoint hook:** `useMediaQuery('(min-width: 1024px)')` in scrollspy hook — IO only when `isLg`.

### TR5 — Accessibility

| | Recommendation |
| --- | -------------- |
| **Scroll-driven nav change** | Do **not** move keyboard focus on scroll-only updates. |
| **Click nav link** | Focus stays on activated link after click. |
| **Announcements** | `aria-live="polite"` on each section **H3**. |
| **Sections** | All four `<section>` nodes in DOM with unique `id` + `aria-labelledby`. |
| **Reduced motion** | Instant scroll on nav click; IO active-state sync retained. |

### TR6 — SSR & hydration

| | Recommendation |
| --- | -------------- |
| **Markup** | Server renders full stacked sections at all breakpoints; no layout shift from artificial scroll track height. |
| **First paint** | `activeTabId` defaults to `listen`; IO attaches after mount on `lg+`. |
| **Hydration** | Sticky nav hidden until `lg:`; mobile shows flowing sections immediately. |

### TR7 — Images & performance

| | Recommendation |
| --- | -------------- |
| **Default tab** | `priority` on listen image only. |
| **Other tabs** | `loading="lazy"`; preload on first `activeTabId` change via `<link rel="preload">` **not** required in v1. |
| **Swap** | Fixed `aspect-[16/10] min-h-[320px]` per section image ([D5](./PRODUCT.md#d5--visual-fidelity-vs-warp-reference)). |
| **Bundle** | Keep `'use client'` boundary in `why-troott/`; do not import Framer in this folder for v1. |

### TR8 — Resize & tablet breakpoints

| Breakpoint | Recommendation |
| ---------- | -------------- |
| **`lg` (1024px+)** | Full scroll showcase + vertical tabs. |
| **`< lg`** | Stacked sections only; tear down IO on `matchMedia` exit. |
| **`md` (768–1023)** | Same as mobile — **no** special tablet layout in v1. |
| **Resize / rotate** | IO reconnects on tab count change; no remount required. |

### TR9 — Scroll conflicts on homepage

Homepage order: `HeroSection` → `WhyTroottSection` → `PreText` → …

| | Recommendation |
| --- | -------------- |
| **Hero** | No overlap — showcase starts below hero; no shared sticky zones. |
| **Text reveal / marquee** | Lower on page — no z-index or scroll listener conflict expected. |
| **Overflow** | Section uses natural height; no `400vh` track — standard page scroll only. |

---

## Scrollspy architecture (desktop `lg+`)

Normative behavior: [PRODUCT D4](./PRODUCT.md#d4--scroll-driven-interaction-desktop-lg).

### DOM structure

```text
<section id="why-troott" class="py-20 sm:py-28">
  <div class="container">
    <!-- Section header (label + 2-line heading) -->

    <div class="hidden lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12">
      <nav class="sticky top-[calc(var(--site-header-height)+1.5rem)] self-start">
        <!-- anchor links; aria-current on active item -->
      </nav>

      <div ref={sectionsRef} class="flex flex-col gap-24 xl:gap-32">
        <section id="why-troott-listen" data-section-id="listen" class="scroll-mt-[...]">
          <!-- eyebrow, title, description + CTA, image -->
        </section>
        <!-- studio, share, churches … -->
      </div>
    </div>

    <!-- mobile: same stacked sections, no nav -->
  </div>
</section>
```

### Active section from scroll

Implement per [TR1](#tr1--scroll-engine). Hook: `useWhyTroottScrollspy.ts`.

```ts
const observer = new IntersectionObserver(
  (entries) => {
    if (isScrollingRef.current) return;
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    const id = visible[0]?.target.getAttribute('data-section-id');
    if (id) setActiveTabId(id as WhyTroottTabId);
  },
  {
    root: null,
    rootMargin: getScrollspyRootMargin(), // e.g. '-88px 0px -55% 0px'
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  },
);
```

### Click → scroll sync

```ts
isScrollingRef.current = true;
document.getElementById(`why-troott-${tabId}`)?.scrollIntoView({
  behavior: prefersReducedMotion ? 'auto' : 'smooth',
  block: 'start',
});
setActiveTabId(tabId);
window.setTimeout(() => { isScrollingRef.current = false; }, 500);
```

### Reduced motion

| Setting | Desktop behavior |
| ------- | ---------------- |
| `prefers-reduced-motion: reduce` | Same scrollspy layout; **instant** scroll on nav click; IO active-state updates **remain** |
| default | Smooth scroll on nav click; IO sync on scroll |

### Mobile (`< lg`)

Stacked sections only — **no** scrollspy, **no** sticky nav. Normal document flow.

---

## Layout (desktop `lg+`, pinned state)

```text
┌─────────────────────────────────────────────────────────────┐
│  WHY TROOTT                                                   │
│  Listen with focus.                                           │
│  Share with confidence.                                       │
├──────────────────┬──────────────────────────────────────────┤
│ ▌ Troott App     │  [icon] TROOTT APP                        │
│   Troott Studio  │  Start in the app                         │
│   Share & grow   │  Paragraph…                               │
│   For churches   │  [ Get the app ]                          │
│                  │  ┌────────────────────────────────────┐  │
│                  │  │     product screenshot              │  │
│                  │  └────────────────────────────────────┘  │
└──────────────────┴──────────────────────────────────────────┘
```

**Grid:** `lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12 xl:gap-16`

**Tab nav row:**

- Full-width button, left-aligned icon + label
- Active: `text-white border-l-2 border-white pl-4`
- Inactive: `text-zinc-500 border-l-2 border-transparent pl-4 hover:text-zinc-300`
- `border-b border-white/10` between items (Warp dividers)

**Panel media:**

- Fixed aspect ratio container e.g. `aspect-[16/10] min-h-[320px]` to limit CLS on tab change
- `Image` `fill` + `object-contain` or `object-cover` per asset art direction

---

## Component API

```tsx
// WhyTroottSection.tsx
'use client';

import { whyTroottContent } from '@/_data/troott/why-troott';
import { useWhyTroottScrollspy } from './useWhyTroottScrollspy';

export function WhyTroottSection(props?: Partial<WhyTroottContent>) {
  const content = { ...whyTroottContent, ...props };
  const { activeTabId, scrollToSection, sectionsRef } =
    useWhyTroottScrollspy(content);

  // lg+: sticky nav + stacked sections (scrollspy)
  // < lg: stacked sections only
}
```

**Listen tab CTA:** Prefer `<GetTroottButton />` from feat-0003 when merged; else link to `siteConfig.baseLinks.listeners` until then.

---

## Accessibility

Normative detail: [TR5](#tr5--accessibility).

| Requirement | Implementation |
| ----------- | -------------- |
| Nav list | `<nav aria-label="…">` + `<ul>` of anchor links; `aria-current="true"` on active item |
| Scroll-driven change | Updates `activeTabId`; **no** focus move; `aria-live="polite"` on section H3 |
| Section | `<section id="why-troott-{id}" aria-labelledby="…-title">` per tab |
| Reduced motion | Instant scroll on nav click; IO sync retained ([D4](./PRODUCT.md#d4--scroll-driven-interaction-desktop-lg)) |

---

## Animation

```css
/* panel enter — optional Tailwind */
transition-opacity duration-200 ease-out
data-[state=inactive]:hidden /* Radix */
```

Image: swap `key={tabId}` on wrapper to remount, or crossfade two layers — prefer **single image remount** for simplicity (acceptable CLS if container has min-height).

---

## Homepage integration

```tsx
// app/page.tsx (after feat-0004)
import { WhyTroottSection } from '@/components/containers/why-troott';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhyTroottSection />
      {/* remove: <CoreFeaturesSection {...coreFeaturesContent} /> */}
      <PreText />
      ...
    </main>
  );
}
```

---

## Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Add `_data/troott/why-troott.ts` per [PRODUCT R1](./PRODUCT.md#r1--copy--content-migration) |
| 2 | Add `--site-header-height` + types |
| 3 | Implement `useWhyTroottScrollspy` per [TR1–TR3](#tr1--scroll-engine) |
| 4 | Desktop: sticky nav + stacked sections (`lg+`) |
| 5 | Desktop: nav click → `scrollToSection`; IO → `activeTabId` |
| 6 | Mobile: stacked flowing sections per [PRODUCT R5](./PRODUCT.md#r5--mobile-layout) |
| 7 | Wire CTAs per [PRODUCT R6](./PRODUCT.md#r6--ctas--external-links) |
| 8 | Reduced-motion branch + SSR hydration per [TR6](#tr6--ssr--hydration) |
| 9 | Update `page.tsx`; delete `core-features.ts` per [PRODUCT R8](./PRODUCT.md#r8--legacy-cleanup) |
| 10 | QA: scroll steps, navbar offset, reverse scroll, Safari sticky |
| 11 | axe / keyboard pass |

---

## Testing

| Type | Coverage |
| ---- | -------- |
| Manual | Scroll through section: nav highlights listen → studio → share → churches |
| Manual | Click nav item smooth-scrolls to section; active state updates |
| Manual | Reverse scroll activates previous section in nav |
| Manual | All four sections visible when scrolled; CTA hrefs correct; images load |
| Manual | 375px / 768px / 1280px breakpoints |
| Manual | Sticky nav clears navbar ([TR3](./TECH.md#tr3--navbar-offset)) |
| Manual | Safari iOS + macOS sticky nav + `scrollIntoView` |
| Manual | Section `scroll-mt` clears fixed header on anchor jump |
| Unit (optional) | `why-troott.ts` exports 4 tabs, unique ids |
| Build | `pnpm --filter @troott/website build` |

No Playwright requirement in v1 unless website E2E suite already exists.

---

## Performance

Per [TR7](#tr7--images--performance):

- Lazy-load non-default tab images; `priority` on listen tab only.
- Client bundle isolated to `why-troott/`; no Framer import in v1.
- Optional P2: `@vercel/analytics` tab events ([PRODUCT R6](./PRODUCT.md#r6--ctas--external-links)).

---

## Rollback

Re-enable `CoreFeaturesSection` + `coreFeaturesContent` in `page.tsx` — one-line revert if tabbed section blocks release.

---

## Assets folder

Copy Warp reference screenshots to:

```text
specs/website/feature/feat-0004/assets/
  warp-why-terminal.png
  warp-why-oz.png
```

Used for design QA only — not shipped in `public/`.
