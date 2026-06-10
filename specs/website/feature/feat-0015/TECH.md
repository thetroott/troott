# feat-0015: Tech — Audience landing pages (`/listener`, `/minister`)

## Context

See [PRODUCT.md](./PRODUCT.md). Two new App Router pages on `apps/website` with shared presentation components and per-audience content in `_data/`.

---

## Objective

1. Add `_data/troott/audience-landing.ts` content model.
2. Add `AudienceLandingPage` container (hero + value props + cross-link).
3. Wire `app/listener/page.tsx` and `app/minister/page.tsx`.
4. Update `siteConfig`, `Footer`, and `next.config.ts` redirects.
5. Update [`specs/website/README.md`](../../README.md) index.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| CTAs | `GetTroottButton` (listener), `Button` + `Link` (minister / cross-links) |
| Icons | `@remixicon/react` optional in v1 |
| Styling | Tailwind dark-only |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: `/listener`, `/minister`, footer links, nav dropdown links, `/listeners` → `/listener`, `/ministers` → `/minister`.

---

## Project structure

```text
apps/website/
├── app/
│   ├── listener/page.tsx
│   └── minister/page.tsx
├── _data/troott/
│   └── audience-landing.ts
└── components/containers/audience-landing/
    ├── index.ts
    └── AudienceLandingPage.tsx
```

---

## Content model

```typescript
// _data/troott/audience-landing.ts

export type AudienceLandingCta =
    | { kind: 'get-troott'; label: string }
    | { kind: 'link'; label: string; href: string; external?: boolean };

export type AudienceLandingContent = {
    audience: 'listener' | 'minister';
    metadata: { title: string; description: string };
    eyebrow: string;
    headline: string;
    headlineMuted: string;
    subtext: string;
    primaryCta: AudienceLandingCta;
    secondaryCta?: AudienceLandingCta & { kind: 'link' };
    valueProps: { title: string; description: string }[];
    crossLink: {
        prefix: string;
        linkLabel: string;
        href: string;
    };
};

export const listenerLandingContent: AudienceLandingContent;
export const ministerLandingContent: AudienceLandingContent;
```

Copy strings match [PRODUCT.md D3–D4](./PRODUCT.md).

---

## `AudienceLandingPage`

Client boundary **only** if newsletter fallback is needed for listener CTA (same pattern as `HeroSection` + `DownloadsSection`).

### Hero

- Map `primaryCta`:
  - `get-troott` → `GetTroottButton` + `Newsletter` modal on fallback (`user_type="listener"`, `track('listenerSignup')`).
  - `link` → `Button asChild` + `Link`, `target="_blank"` when `external`.
- Map `secondaryCta` when present → outline `Button asChild`.

### Value props

- Map `valueProps` to three bordered cards in responsive grid ([PRODUCT D2](./PRODUCT.md)).

### Cross-link

- Single centered `<p>` with `Link` to `crossLink.href`.

---

## Route files

```typescript
// app/listener/page.tsx
import type { Metadata } from 'next';
import { listenerLandingContent } from '@/_data/troott/audience-landing';
import { AudienceLandingPage } from '@/components/containers/audience-landing';

export const metadata: Metadata = {
    title: listenerLandingContent.metadata.title,
    description: listenerLandingContent.metadata.description,
};

export default function ListenerPage() {
    return (
        <main className="flex flex-col">
            <AudienceLandingPage content={listenerLandingContent} />
        </main>
    );
}
```

Mirror for `app/minister/page.tsx` with `ministerLandingContent`.

---

## Config updates

### `siteConfig.tsx`

```typescript
listeners: '/listener',
ministers: '/minister',
requestDemo: requestDemoUrl || '/minister',
```

### `Footer.tsx`

```typescript
{ name: 'Ministers', href: '/minister', external: false },
{ name: 'Listeners', href: '/listener', external: false },
```

Or use `siteConfig.baseLinks` for consistency.

### `next.config.ts`

```typescript
{ source: '/listeners', destination: '/listener', permanent: true },
{ source: '/ministers', destination: '/minister', permanent: true },
```

---

## Layout interaction

Root [`layout.tsx`](../../../apps/website/app/layout.tsx) renders `DownloadsSection` after `{children}` on all routes. **v1:** no change. Minister page still shows downloads strip — acceptable per PRODUCT assumptions.

---

## Out of scope (v1)

- Segment-specific layouts hiding downloads/footer.
- Duplicating homepage section stack on audience pages.
- Changing `Mission` / `TextSection1` section ids on `/`.

---

## Checklist

- [ ] `_data/troott/audience-landing.ts`
- [ ] `AudienceLandingPage.tsx` (+ `index.ts` barrel)
- [ ] `app/listener/page.tsx`, `app/minister/page.tsx`
- [ ] `siteConfig.tsx` link updates
- [ ] `Footer.tsx` link updates
- [ ] `next.config.ts` redirects
- [ ] `specs/website/README.md` feat-0015 row
- [ ] Build + lint pass
