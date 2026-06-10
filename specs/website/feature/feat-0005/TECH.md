# feat-0005: Tech — “Get Troott today” downloads grid

## Context

See [PRODUCT.md](./PRODUCT.md). Warp-style **three-column download grid** for `apps/website` homepage.

**Closed decisions:** [D1 Placement](./PRODUCT.md#d1--section-placement), [D2 Columns](./PRODUCT.md#d2--platform-columns-v1), [D3 CTAs](./PRODUCT.md#d3--primary-download-ctas), [D4 Copy pills](./PRODUCT.md#d4--secondary-rows--copy-link), [D5 Visuals](./PRODUCT.md#d5--visual-fidelity-vs-warp-reference).

**Recommendations:** [TR1 Structure](#tr1--project-structure), [TR2 Data model](#tr2--data-model), [TR3 Components](#tr3--components), [TR4 Copy pill](#tr4--copy-link-pill), [TR5 feat-0003 reuse](#tr5--feat-0003-reuse), [TR6 Homepage wire-up](#tr6--homepage-integration), [TR7 Shared helper](#tr7--shared-get-troott-helper), [TR8 Client boundary](#tr8--server--client-boundary), [TR9 Copy util](#tr9--copy-to-clipboard), [TR10 Analytics](#tr10--analytics), [TR11 Spacing](#tr11--spacing-with-ctasection), [TR12 QA](#tr12--extended-qa).

---

## Objective

Implement **`DownloadsSection`** with **`DownloadPlatformColumn`** tiles, **`CopyDownloadLink`** pills, content from `_data/troott/downloads.ts`, and homepage placement after FAQs.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Styling | Tailwind + feat-0001 dark tokens |
| Icons | `@remixicon/react` |
| Toast | `sonner` (existing) |
| URLs | feat-0003 `getTroottDownloadUrl` / `siteConfig.baseLinks.getTroott` |
| Clipboard | `navigator.clipboard.writeText` with fallback `document.execCommand('copy')` |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: click each primary tile (get-troott redirect); copy each pill; feature flag off → newsletter; 375px stack.

---

## Recommendations (binding unless overridden)

### TR1 — Project structure

```text
apps/website/
├── app/page.tsx
├── _data/troott/downloads.ts              # NEW
├── lib/
│   ├── build-get-troott-url.ts            # feat-0003 (reuse or co-add)
│   ├── get-troott-download.ts             # NEW — isGetTroottEnabled + URL export ([TR7](#tr7--shared-get-troott-helper))
│   └── copy-to-clipboard.ts               # NEW — [TR9](#tr9--copy-to-clipboard)
├── components/containers/downloads/
│   ├── DownloadsSection.tsx               # NEW — section shell
│   ├── DownloadPlatformColumn.tsx         # NEW — one column
│   ├── DownloadPlatformTile.tsx           # NEW — cream primary CTA
│   ├── CopyDownloadLink.tsx               # NEW — dark pill + copy
│   ├── types.ts
│   └── index.ts
```

### TR2 — Data model

```ts
// _data/troott/downloads.ts
import { siteConfig } from '@/app/siteConfig';
import type { DownloadPlatformId } from '@/components/containers/downloads/types';

export type DownloadPlatform = {
  id: DownloadPlatformId; // 'ios' | 'android' | 'web'
  title: string;
  icon: 'apple' | 'google-play' | 'globe';
  primary: { title: string; subtitle: string; package: 'ios' | 'android' | 'web' };
  copyLabel?: string; // display in pill; defaults to full URL
};

export type DownloadsContent = {
  label: string;
  heading: string;
  description: string;
  studioLink: { label: string; href: string };
  platforms: DownloadPlatform[];
};

export const downloadsContent: DownloadsContent = {
  label: 'ALL DOWNLOADS',
  heading: 'Get Troott today',
  description:
    'Listen on iPhone, Android, or in your browser. Ministers can publish from Troott Studio.',
  studioLink: { label: 'Open Troott Studio', href: siteConfig.baseLinks.studio },
  platforms: [
    {
      id: 'ios',
      title: 'iPhone & iPad',
      icon: 'apple',
      primary: { title: 'App Store', subtitle: 'iOS 16 or later', package: 'ios' }, // iOS min: app.json deploymentTarget 16.0
    },
    {
      id: 'android',
      title: 'Android',
      icon: 'google-play',
      primary: { title: 'Google Play', subtitle: 'Android 8 or later', package: 'android' },
    },
    {
      id: 'web',
      title: 'Web app',
      icon: 'globe',
      primary: { title: 'Open in browser', subtitle: 'Any modern browser', package: 'web' },
    },
  ],
};
```

### TR3 — Components

**`DownloadsSection`** — mostly server component; wrap copy pills + optional newsletter fallback in client boundary.

```tsx
// DownloadsSection.tsx (sketch)
export function DownloadsSection(props?: Partial<DownloadsContent>) {
  const content = { ...downloadsContent, ...props };
  return (
    <section id="downloads" aria-labelledby="downloads-heading" className="...">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* label, h2, description + studio Link */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {content.platforms.map((p) => (
            <DownloadPlatformColumn key={p.id} platform={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**`DownloadPlatformTile`** — client if newsletter fallback needed:

```tsx
const href = getTroottDownloadUrl(platform.primary.package);
const enabled = process.env.NEXT_PUBLIC_GET_TROOTT_ENABLED === 'true';

if (!enabled) {
  return (
    <button type="button" onClick={openListenerNewsletter} className="cream-tile-classes">
      ...
    </button>
  );
}

return (
  <a href={href} target="_blank" rel="noopener noreferrer" className="cream-tile-classes">
    <span className="font-semibold">{primary.title}</span>
    <span className="text-sm text-zinc-600">{primary.subtitle}</span>
  </a>
);
```

**Cream tile classes (normative):**

```text
flex w-full flex-col items-start rounded-2xl bg-[#FDFCF0] px-6 py-5 text-left text-black
transition hover:bg-[#f5f4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
```

### TR4 — Copy link pill

```tsx
'use client';

export function CopyDownloadLink({ url, platform }: { url: string; platform: string }) {
  const display = formatCopyDisplayUrl(url); // truncate on narrow — TR9

  async function copy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      track('download_link_copy', { platform });
      toast.success('Link copied');
    } else {
      toast.error('Could not copy link');
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2.5">
      <code className="min-w-0 flex-1 truncate text-xs text-zinc-400 sm:text-sm">{url}</code>
      <button type="button" onClick={copy} aria-label="Copy download link" className="shrink-0 ...">
        <RiFileCopyLine />
      </button>
    </div>
  );
}
```

URL passed in: `getTroottDownloadUrl(platform.primary.package)`.

### TR5 — feat-0003 reuse

See [TR7](#tr7--shared-get-troott-helper) for normative shared module. Summary:

| Piece | Action |
| ----- | ------ |
| `siteConfig.baseLinks.getTroott` | Add in feat-0003 if not merged yet |
| `getTroottDownloadUrl()` / `isGetTroottEnabled()` | Import from `lib/get-troott-download.ts` |
| Newsletter fallback | Reuse `NewsletterModal` + listener role from `CTASection`; `track(..., { source: 'downloads_section' })` |

Do **not** add Play/App Store URLs to `downloads.ts`.

### TR6 — Homepage integration

```tsx
// app/page.tsx
import { DownloadsSection } from '@/components/containers/downloads';

export default function Home() {
  return (
    <main className="flex flex-col overflow-x-hidden">
      ...
      <Faqs />
      <DownloadsSection />
      <CTASection />
    </main>
  );
}
```

If feat-0004 changed `main` overflow, prefer `overflow-x-hidden` only ([feat-0004 TR9](../feat-0004/TECH.md#tr9--scroll-conflicts-on-homepage)).

### TR7 — Shared get-troott helper

Implement [PRODUCT R8](./PRODUCT.md#r8--feat-0003-alignment--shared-helper):

```ts
// lib/get-troott-download.ts
import { getTroottDownloadUrl as buildUrl } from './build-get-troott-url';

export function isGetTroottEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GET_TROOTT_ENABLED === 'true';
}

export { buildUrl as getTroottDownloadUrl };
```

feat-0003 navbar and feat-0005 tiles **both** import from this module after feat-0003 lands.

### TR8 — Server / client boundary

| Component | Render |
| --------- | ------ |
| `DownloadsSection` | **Server** — label, H2, description, studio `Link`, grid shell |
| `DownloadPlatformColumn` | Server wrapper; passes props to client children |
| `DownloadPlatformTile` | **Client** — feature flag, newsletter modal, analytics |
| `CopyDownloadLink` | **Client** — clipboard + toast |

Single client boundary file acceptable: `DownloadsSectionClient.tsx` wrapping grid if that reduces `'use client'` surface.

### TR9 — Copy to clipboard

```ts
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
```

`CopyDownloadLink`: on `false` → `toast.error('Could not copy link')` ([PRODUCT R11](./PRODUCT.md#r11--analytics--copy-failure)).

**Display truncate** ([PRODUCT R7](./PRODUCT.md#r7--closed-copy--ui-decisions)): helper `formatCopyDisplayUrl(url, maxLen)` — full URL on `sm+`.

**Toaster:** Already in [`app/layout.tsx`](../../../apps/website/app/layout.tsx) — no new provider.

### TR10 — Analytics

```tsx
import { track } from '@vercel/analytics';

// DownloadPlatformTile onClick (link) or before navigation
track('download_tile_click', { platform: platform.id });

// CopyDownloadLink after success
track('download_link_copy', { platform });

// Newsletter fallback
track('listenerSignup', { source: 'downloads_section' });
```

### TR11 — Spacing with CTASection

[`CTASection`](../../../apps/website/components/containers/CallToAction.tsx) uses `mt-32 sm:mt-40`. When `DownloadsSection` is directly above:

| | Recommendation |
| --- | -------------- |
| **DownloadsSection** | `pb-24 sm:pb-32` bottom padding |
| **CTASection** | Change to `mt-16 sm:mt-24` **when** downloads section present (same PR) — avoids ~56px + 128px double gap |

Alternatively wrap both in a `<div className="space-y-16">` — pick one approach in implement.

### TR12 — Extended QA

| Case | Expected |
| ---- | -------- |
| get-troott live | Each tile → 302 to store/web |
| Flag off | All tiles → listener newsletter |
| Copy denied | Error toast |
| iOS Safari | Copy + tile open |
| feat-0004 homepage | Downloads still after Faqs ([PRODUCT R12](./PRODUCT.md#r12--launch-order--homepage-stack)) |

---

## Layout (desktop)

```text
┌──────────────────────────────────────────────────────────────────┐
│  ALL DOWNLOADS                                                    │
│  Get Troott today                                                   │
│  Listen on iPhone… Open Troott Studio →                          │
├─────────────────┬─────────────────┬──────────────────────────────┤
│   [Apple icon]  │  [Play icon]    │   [Globe icon]               │
│  iPhone & iPad  │  Android        │   Web app                    │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐              │
│ │ App Store   │ │ │ Google Play │ │ │ Open in browser │ cream tiles │
│ │ iOS 16+     │ │ │ Android 8+  │ │ │ Any browser │              │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘              │
│ [ copy pill   ] │ [ copy pill   ] │ [ copy pill   ]              │
└─────────────────┴─────────────────┴──────────────────────────────┘
```

---

## Typography (align feat-0004 R2 + PRODUCT R10)

| Element | Classes |
| ------- | ------- |
| Label | `font-mono text-[13px] text-zinc-500` |
| H2 | `text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]` |
| Description | `mt-4 max-w-2xl text-base text-zinc-400` |
| Studio link | `mt-3 inline-block text-white underline underline-offset-4 hover:text-zinc-300` |
| Column icon | `mx-auto mb-3 size-8 text-white` |
| Column H3 | `mb-4 text-center text-lg font-medium text-white` |

---

## Accessibility

| Requirement | Implementation |
| ----------- | -------------- |
| Section | `aria-labelledby="downloads-heading"` |
| Primary tiles | Real `<a>` when get-troott enabled; `<button>` when fallback |
| Copy button | `aria-label={`Copy download link for ${platformTitle}`}` |
| Column icons | Decorative: `aria-hidden="true"` on icon SVG |
| Tile link | `aria-label={`Get Troott on ${platformTitle}`}` when visible text is generic |
| Toast | `role="status"` via sonner |
| Keyboard | Copy + tiles focusable; visible focus ring |

---

## Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Ensure feat-0003 URL builder + `siteConfig.getTroott` ([TR7](#tr7--shared-get-troott-helper)) |
| 2 | Add `_data/troott/downloads.ts` ([TR2](#tr2--data-model), [R9](./PRODUCT.md#r9--platform-version-subtitles)) |
| 3 | Add `copy-to-clipboard.ts` + `formatCopyDisplayUrl` ([TR9](#tr9--copy-to-clipboard)) |
| 4 | Implement client tiles + copy pill with analytics ([TR10](#tr10--analytics)) |
| 5 | Implement `DownloadsSection` ([TR8](#tr8--server--client-boundary)) |
| 6 | Wire homepage + CTA spacing ([TR6](#tr6--homepage-integration), [TR11](#tr11--spacing-with-ctasection)) |
| 7 | Gate on feature flag + newsletter fallback |
| 8 | Visual QA vs `./assets/warp-all-downloads.png` |
| 9 | Verify get-troott with feat-0035 ([TR12](#tr12--extended-qa)) |

---

## Testing

| Type | Coverage |
| ---- | -------- |
| Manual | Three primary links open `app.troott.com/get-troott?package=*` |
| Manual | Copy pills → clipboard + toast |
| Manual | Copy failure → error toast ([TR9](#tr9--copy-to-clipboard)) |
| Manual | Analytics events fire (devtools / Vercel) ([TR10](#tr10--analytics)) |
| Manual | Spacing vs CTASection ([TR11](#tr11--spacing-with-ctasection)) |
| Manual | Flag off → newsletter on tile click |
| Manual | Mobile stack 375px |
| Build | `pnpm --filter @troott/website build` |

---

## Rollback

Remove `<DownloadsSection />` from `page.tsx` — no other homepage blocks affected.

---

## Assets

```text
specs/website/feature/feat-0005/assets/
  warp-all-downloads.png
```

Design QA only — not shipped in `public/`.
