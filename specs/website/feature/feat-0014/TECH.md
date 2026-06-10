# feat-0014: Tech — Legal audience chooser + scrollspy documents

## Context

See [PRODUCT.md](./PRODUCT.md). New **`/legal`** route tree on `apps/website` reusing **Why Troott scrollspy** layout and behavior.

**Code reference (must match):**

- [`WhyTroottSection.tsx`](../../../apps/website/components/containers/why-troott/WhyTroottSection.tsx)
- [`useWhyTroottScrollspy.ts`](../../../apps/website/components/containers/why-troott/useWhyTroottScrollspy.ts)

---

## Objective

1. Extract reusable **`useScrollspy`** + **`ScrollspyLayout`** from `why-troott`.
2. Implement **`LegalAudiencePage`**, **`LegalHubPage`**, **`LegalDocumentPage`**.
3. Add `_data/legal/**` content.
4. Wire routes under `app/legal/`.
5. Add `/privacy` and `/terms` redirects.
6. Update footer + `siteConfig` links.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Scrollspy | Extracted from `useWhyTroottScrollspy` |
| Icons | `@remixicon/react` |
| Prose | `prose prose-invert` optional — or explicit Tailwind on legal HTML |
| Styling | Tailwind dark-only |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: `/legal`, each **listener** and **minister** hub + doc route, scrollspy sync, mobile flow, redirects `/privacy` `/terms`.

---

## Project structure

```text
apps/website/
├── app/legal/
│   ├── page.tsx                              # audience chooser
│   ├── listener/
│   │   ├── page.tsx                          # hub
│   │   ├── terms-of-use/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   ├── cookies/page.tsx
│   │   └── gdpr/page.tsx
│   └── minister/
│       ├── page.tsx                          # hub
│       ├── terms-of-use/page.tsx
│       ├── privacy-policy/page.tsx
│       ├── cookies/page.tsx
│       └── gdpr/page.tsx
├── _data/legal/
│   ├── types.ts
│   ├── documents.ts                          # doc switcher nav per audience
│   ├── listener/
│   │   ├── hub.ts
│   │   ├── terms-of-use.ts
│   │   ├── privacy-policy.ts
│   │   ├── cookies.ts
│   │   └── gdpr.ts
│   └── minister/
│       ├── hub.ts
│       ├── terms-of-use.ts
│       ├── privacy-policy.ts
│       ├── cookies.ts
│       └── gdpr.ts
├── components/
│   ├── shared/scrollspy/
│   │   ├── useScrollspy.ts                   # extracted from why-troott
│   │   ├── ScrollspyLayout.tsx               # grid + sticky nav shell
│   │   ├── ScrollspyNav.tsx                  # nav row chrome
│   │   └── scrollspy-dom.ts                  # sectionDomId, getSiteHeaderScrollOffsetPx
│   └── containers/legal/
│       ├── LegalAudiencePage.tsx
│       ├── LegalHubPage.tsx
│       ├── LegalDocumentPage.tsx
│       ├── LegalDocSwitcher.tsx              # Group A route links
│       ├── LegalProseSection.tsx             # right-column section block
│       └── index.ts
├── next.config.ts                            # redirects /privacy, /terms
└── app/siteConfig.tsx                        # legal baseLinks
```

**Refactor (recommended):** Update `why-troott` to import shared `useScrollspy` — avoids drift.

---

## Route map

**Parity:** Listener and Minister share the same components; pass `audience: 'listener' | 'minister'` from route params.

| Path | Component | Scrollspy sections |
| ---- | --------- | ------------------ |
| `/legal` | `LegalAudiencePage` | — |
| `/legal/listener` | `LegalHubPage` (`audience="listener"`) | — (overview only) |
| `/legal/listener/terms-of-use` | `LegalDocumentPage` | yes |
| `/legal/listener/privacy-policy` | `LegalDocumentPage` | yes |
| `/legal/listener/cookies` | `LegalDocumentPage` | yes |
| `/legal/listener/gdpr` | `LegalDocumentPage` | yes |
| `/legal/minister` | `LegalHubPage` (`audience="minister"`) | — (overview only) |
| `/legal/minister/terms-of-use` | `LegalDocumentPage` | yes |
| `/legal/minister/privacy-policy` | `LegalDocumentPage` | yes |
| `/legal/minister/cookies` | `LegalDocumentPage` | yes |
| `/legal/minister/gdpr` | `LegalDocumentPage` | yes |

### Route files (minister mirrors listener)

```text
app/legal/
├── page.tsx
├── listener/
│   ├── page.tsx
│   ├── terms-of-use/page.tsx
│   ├── privacy-policy/page.tsx
│   ├── cookies/page.tsx
│   └── gdpr/page.tsx
└── minister/
    ├── page.tsx
    ├── terms-of-use/page.tsx
    ├── privacy-policy/page.tsx
    ├── cookies/page.tsx
    └── gdpr/page.tsx
```

Each document `page.tsx` is thin — loads content via `getLegalDocument(audience, slug)`:

```tsx
// app/legal/minister/privacy-policy/page.tsx
import { LegalDocumentPage } from '@/components/containers/legal';
import { getLegalDocument } from '@/_data/legal/documents';

export default function MinisterPrivacyPage() {
  const document = getLegalDocument('minister', 'privacy-policy');
  return <LegalDocumentPage document={document} audience="minister" />;
}
```

---

## Shared scrollspy extraction

### `scrollspy-dom.ts`

Move from `useWhyTroottScrollspy.ts`:

- `getSiteHeaderScrollOffsetPx()`
- `sectionDomId(prefix: string, id: string)` → `legal-section-{id}`

### `useScrollspy.ts`

Generalize:

```ts
export function useScrollspy<T extends string>({
  defaultSectionId,
  sectionIds,
}: {
  defaultSectionId: T;
  sectionIds: readonly T[];
}) {
  // same logic as useWhyTroottScrollspy — reading line activation
  return { activeSectionId, scrollToSection, sectionsRef };
}
```

`why-troott` becomes:

```ts
useScrollspy({ defaultSectionId: 'listen', sectionIds: tabs.map(t => t.id) });
```

### `ScrollspyNavRow.tsx`

Single nav row matching Why Troott classes ([PRODUCT D3](./PRODUCT.md#nav-row-per-item--must-match-why-troott)):

```tsx
type ScrollspyNavRowProps = {
  href: string;
  label: string;
  icon: RemixiconComponentType;
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
};
```

Used for **both** route links (`Link`) and section anchors (`<a href="#...">`).

### `ScrollspyLayout.tsx`

Props:

```tsx
type ScrollspyLayoutProps = {
  header: React.ReactNode;
  nav: React.ReactNode;
  children: React.ReactNode; // right column
  sectionsRef: RefObject<HTMLDivElement | null>;
};
```

Renders:

```tsx
<section className="relative w-full overflow-visible bg-background py-20 sm:py-28">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
    {header}
    <div className="lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-12 xl:gap-16">
      <div className="relative hidden lg:block">
        <nav className="sticky z-10" style={{ top: 'calc(var(--site-header-height, 4rem) + 1.5rem)' }}>
          {nav}
        </nav>
      </div>
      <div ref={sectionsRef} className="flex min-w-0 flex-col gap-16">
        {children}
      </div>
    </div>
  </div>
</section>
```

---

## `LegalDocumentPage`

```tsx
'use client';

export function LegalDocumentPage({ document, audience }: Props) {
  const sectionIds = document.sections.map((s) => s.id);
  const { activeSectionId, scrollToSection, sectionsRef } = useScrollspy({
    defaultSectionId: sectionIds[0]!,
    sectionIds,
  });

  const header = (
    <>
      <p className="font-mono text-[13px] leading-none text-zinc-500">{document.label}</p>
      <h1 className="mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]">
        <span className="block">{document.heading}</span>
        <span className="block text-zinc-500">{document.headingMuted}</span>
      </h1>
    </>
  );

  const nav = (
    <>
      <LegalDocSwitcher audience={audience} currentSlug={document.slug} />
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          In this document
        </p>
        <ul>
          {document.sections.map((section) => (
            <ScrollspyNavRow
              key={section.id}
              href={`#${sectionDomId('legal', section.id)}`}
              label={section.navLabel}
              icon={RiArticleLine}
              isActive={section.id === activeSectionId}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section.id);
              }}
            />
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <ScrollspyLayout header={header} nav={nav} sectionsRef={sectionsRef}>
      {document.sections.map((section) => (
        <LegalProseSection
          key={section.id}
          id={sectionDomId('legal', section.id)}
          sectionId={section.id}
          titleId={`${sectionDomId('legal', section.id)}-title`}
          section={section}
        />
      ))}
    </ScrollspyLayout>
  );
}
```

### `LegalProseSection`

```tsx
<section
  id={id}
  data-section-id={sectionId}
  aria-labelledby={titleId}
  className="scroll-mt-[calc(var(--site-header-height,4rem)+1.5rem)]"
>
  {section.eyebrow ? (
    <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
      {section.eyebrow}
    </p>
  ) : null}
  <h2 id={titleId} className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.875rem]">
    {section.title}
  </h2>
  <div
    className="mt-5 text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7] [&_a]:text-teal-400 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc"
    dangerouslySetInnerHTML={{ __html: section.body }}
  />
</section>
```

Prefer MDX over `dangerouslySetInnerHTML` if team policy requires — v1 may use template strings in `_data`.

---

## Content authoring (monorepo-driven)

See [PRODUCT D7](./PRODUCT.md#d7--content-sources-from-monorepo-apps) for full inventory. Implementation workflow:

### 1. Audit before writing

For each document slug, walk the **per-app source index** in D7 and tick facts that apply. Do not invent data categories not present in API models.

```bash
# Quick grep helpers (run from repo root)
rg -l "privacy|terms|gdpr|cookie|deactivat" apps/{api,mobile,web,website}
rg "isDeactivated|deleteMe|deactivate" apps/api apps/mobile apps/web
```

### 2. `_data/legal` shape (extend types)

```ts
export type LegalDocument = {
  audience: LegalAudience;
  slug: LegalDocSlug;
  label: string;
  heading: string;
  headingMuted: string;       // include "Last updated …"
  lastUpdated: string;        // ISO date — e.g. '2026-03-01'
  sections: LegalSection[];
  /** Traceability — paths reviewed when drafting (not rendered) */
  sourceRefs?: string[];
};
```

Populate `sourceRefs` during drafting, e.g. `['apps/api/src/models/core/listener.model.ts', 'apps/mobile/docs/google-play-store-listing.md']`. Strip or omit before render if not needed in production.

### 3. Section IDs

Use **stable kebab `id`s** from [PRODUCT D7 section outline tables](./PRODUCT.md#document-section-outlines-scrollspy-targets) so nav labels can change without breaking anchors.

### 4. Loader

```ts
// _data/legal/documents.ts
import { listenerTerms } from './listener/terms-of-use';
// ...

const byAudience: Record<LegalAudience, Record<LegalDocSlug, LegalDocument>> = {
  listener: {
    'terms-of-use': listenerTerms,
    'privacy-policy': listenerPrivacy,
    cookies: listenerCookies,
    gdpr: listenerGdpr,
  },
  minister: { /* mirror */ },
};

export function getLegalDocument(audience: LegalAudience, slug: LegalDocSlug) {
  return byAudience[audience][slug];
}

export function getLegalDocNav(audience: LegalAudience) {
  return DOC_NAV[audience]; // Group A switcher rows
}
```

### 5. Cross-app link updates (post-content)

After `_data/legal` ships, update consumers listed in [PRODUCT D7 URL consolidation](./PRODUCT.md#url-consolidation-must-match-after-ship):

| App | File | Change |
| --- | ---- | ------ |
| mobile | `about-troott-screen.tsx` | `/privacy` → `/legal/listener/privacy-policy` (or keep legacy redirect) |
| mobile | `TermsConditions.tsx` | Wire `Linking.openURL` to listener terms + privacy |
| mobile | `docs/google-play-store-listing.md` | Update footer URLs in full description |
| website | `siteConfig.tsx`, `Footer.tsx` | On-site legal hrefs |
| website | `NewsletterModal.tsx` | Privacy checkbox → listener privacy |
| api | `preview.router.ts`, `terms-and-conditions.pug` | Terms URL |

### 6. D8 gap handling in code

Until product fixes deactivate/export:

- Use **“deactivate your account”** in generated copy helpers — not “permanently delete”.
- GDPR **portability** section: “contact hello@troott.com” — match Play Store doc §9.

Flag `// LEGAL_REVIEW` in section body strings where Play Store doc marks TODO (age gate, Terms of Sale).

---

## `LegalAudiencePage` (`/legal`)

Server component OK — static chooser, no scrollspy.

```tsx
// app/legal/page.tsx
import { LegalAudiencePage } from '@/components/containers/legal';

export default function LegalPage() {
  return <LegalAudiencePage />;
}
```

Pixel spec: [PRODUCT D2](./PRODUCT.md#d2--page-1-audience-chooser-pixel-spec).

---

## Redirects (`next.config.ts`)

```ts
async redirects() {
  return [
    { source: '/privacy', destination: '/legal/listener/privacy-policy', permanent: true },
    { source: '/terms', destination: '/legal/listener/terms-of-use', permanent: true },
  ];
}
```

---

## Metadata

Per document page:

```ts
export function generateMetadata({ params }: Props): Metadata {
  const audience = params.audience as LegalAudience; // 'listener' | 'minister'
  const doc = getLegalDocument(audience, params.slug);
  const audienceLabel = audience === 'minister' ? 'Minister' : 'Listener';
  return {
    title: `${doc.heading} | Troott Legal (${audienceLabel})`,
    description: doc.headingMuted,
    robots: { index: true, follow: true },
  };
}
```

---

## Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Extract `components/shared/scrollspy/*` from why-troott |
| 2 | Refactor `WhyTroottSection` to use shared scrollspy (parity test) |
| 3 | `_data/legal/types.ts` + `documents.ts` + `sourceRefs` traceability |
| 4 | Draft listener docs from [PRODUCT D7](./PRODUCT.md#d7--content-sources-from-monorepo-apps) outlines |
| 4b | Draft minister docs (same outlines; minister-specific sections) |
| 5 | `LegalDocumentPage` + `LegalDocSwitcher` (audience-scoped routes) |
| 6 | `LegalAudiencePage` + `LegalHubPage` |
| 7 | `app/legal/listener/**` + `app/legal/minister/**` routes |
| 8 | `next.config.ts` redirects |
| 9 | Footer + `siteConfig` legal URLs |
| 10 | Cross-app URL updates (mobile, api email — see content authoring §5) |
| 11 | Pixel QA 1440 / 375; axe keyboard — both audiences |
| 12 | Legal review pass on D8 gaps before removing placeholder disclaimers |

---

## Testing

| Type | Coverage |
| ---- | -------- |
| Manual | Chooser cards link to `/legal/listener` and `/legal/minister` |
| Manual | Listener + minister doc switchers stay within their audience base path |
| Manual | All eight document routes render scrollspy (four per audience) |
| Manual | Scrollspy section highlight while scrolling |
| Manual | Click section nav scrolls with header offset |
| Manual | `/privacy` → listener privacy-policy |
| Manual | Sticky nav works (no `overflow-x-hidden` on main) |
| Build | website build passes |

---

## Rollback

Remove `app/legal/`, revert footer links to Notion, remove redirects — isolated feature.
