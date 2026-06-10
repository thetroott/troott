# feat-0014: Legal — audience chooser + scrollspy document pages

## Summary

Add a **new Legal area** on the marketing site:

1. **Page 1 — Choose audience:** Minister vs Listener (`/legal`).
2. **Listener legal documents** (hub + four docs) with **Why Troott scrollspy layout** — sticky left nav, stacked sections, scroll-synced active state ([feat-0004](../feat-0004/PRODUCT.md) pattern; code reference [`why-troott/`](../../../apps/website/components/containers/why-troott/)).
3. **Minister legal documents** — **same route tree, layout, and scrollspy behavior** as Listener; placeholder copy OK until legal review.

**App:** `apps/website` (`troott.com`). **Dark-only** [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Routes](#d1--routes), [Chooser page](#d2--page-1-audience-chooser-pixel-spec), [Scrollspy layout](#d3--legal-document-pages-scrollspy-layout), [Nav model](#d4--left-rail-navigation-model), [Content model](#d5--content-model), [Redirects](#d6--legacy-url-redirects), [Monorepo content sources](#d7--content-sources-from-monorepo-apps).

**Recommendations:** [R1 Copy](#r1--page-copy), [R2 Icons](#r2--nav-icons), [R3 Footer](#r3--footer--siteconfig), [R4 Minister](#r4--minister-v1).

---

## Assumptions (specify phase)

1. Legal copy ships in **`_data/legal/`** (TypeScript or MDX) — **not** Notion embeds (replaces external Privacy link in footer).
2. **Listener** and **Minister** each ship **hub + four document routes** in v1; Minister may use placeholder sections until legal review.
3. Scrollspy **hook and nav chrome** are **shared** with `why-troott` (extracted), not duplicated.
4. Mobile app URLs `https://www.troott.com/privacy` and `/terms` **redirect** to listener legal docs ([D6](#d6--legacy-url-redirects)).
5. No auth gate — all legal pages are public.

Correct product if any assumption is wrong before implementation.

---

## Problem

| Today | Gap |
| ----- | --- |
| Privacy links to **Notion** (`siteConfig.baseLinks.privacy`) | No on-site legal hub; poor SEO and in-app WebView consistency |
| Terms href is **`/`** placeholder | No terms of use page |
| No Cookies / GDPR pages | Compliance and footer completeness |
| No Minister vs Listener split | Studio vs app policies need separate audiences |
| Long-form legal has **no** sticky TOC | feat-0004 scrollspy pattern exists on homepage only |

**Goal:** Ship `/legal` chooser + **Listener and Minister** legal hubs and document pages using **pixel-matched** Why Troott scrollspy layout for reading experience.

---

## D1 — Routes

### Page 1 — Audience chooser

| Route | Page |
| ----- | ---- |
| `/legal` | Choose **Minister** or **Listener** |

### Listener (v1 — required)

| Route | Document |
| ----- | -------- |
| `/legal/listener` | Listener legal **hub** (overview + links to four docs) |
| `/legal/listener/terms-of-use` | Terms of Use |
| `/legal/listener/privacy-policy` | Privacy Policy |
| `/legal/listener/cookies` | Cookie Policy |
| `/legal/listener/gdpr` | GDPR / data rights |

### Minister (v1 — required, same tree as Listener)

| Route | Document |
| ----- | -------- |
| `/legal/minister` | Minister legal **hub** (overview + links to four docs) |
| `/legal/minister/terms-of-use` | Terms of Use (Studio) |
| `/legal/minister/privacy-policy` | Privacy Policy (Studio) |
| `/legal/minister/cookies` | Cookie Policy |
| `/legal/minister/gdpr` | GDPR / data rights |

**Parity rule:** Every Listener route has a **1:1 Minister equivalent** — same page components (`LegalHubPage`, `LegalDocumentPage`), same scrollspy layout ([D3](#d3--legal-document-pages-scrollspy-layout)), same nav groups ([D4](#d4--left-rail-navigation-model)). Only `audience` param and `_data/legal/{audience}/` content differ.

**URL rules:**

- Kebab-case slugs only.
- Audience segment: `listener` \| `minister`.
- No trailing slash requirement (Next.js default).

```text
/legal
├── /listener                    # hub
│   ├── /terms-of-use
│   ├── /privacy-policy
│   ├── /cookies
│   └── /gdpr
└── /minister                    # hub (mirror)
    ├── /terms-of-use
    ├── /privacy-policy
    ├── /cookies
    └── /gdpr
```

---

## D2 — Page 1: Audience chooser (pixel spec)

Reference: two equal **choice cards** on dark shell — centered content, not scrollspy.

### Section shell

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Route | `/legal` | `app/legal/page.tsx` |
| Background | `bg-background` | same as site |
| Section padding Y | **80px** → **112px** `lg` | `py-20 lg:py-28` |
| Container | `max-w-7xl` | `container mx-auto max-w-7xl px-4 md:px-6` |
| Content max width | **640px** centered | `mx-auto max-w-[640px] text-center` |

### Header

| Element | Spec | Tailwind |
| ------- | ---- | -------- |
| Eyebrow | `// Legal` | `font-mono text-[13px] leading-none text-zinc-500` |
| Eyebrow → H1 gap | **20px** | `mt-5` |
| H1 line 1 | `Choose your` · **40px** mobile / **48px** `lg` · semibold white | `text-[2.5rem] lg:text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-white` |
| H1 line 2 | `legal documents.` · zinc-500 | `block text-zinc-500` |
| H1 → cards gap | **48px** | `mt-12` |

### Choice cards (2-up)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Layout | 1 col mobile → **2 col** `sm+` | `grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6` |
| Card min height | **160px** | `min-h-[160px]` |
| Card padding | **24px** | `p-6` |
| Card bg | `#111111` | `bg-[#111111]` |
| Card border | `1px` white/10 | `border border-white/10` |
| Card radius | **12px** | `rounded-xl` |
| Card hover | border white/20 | `hover:border-white/20 transition-colors` |
| Icon box | **40×40px**, `rounded-sm`, `bg-teal-400/20` | `size-10 rounded-sm bg-teal-400/20 flex items-center justify-center` |
| Icon | **20px** teal | `size-5 text-teal-400` |
| Title | **18px** medium white | `text-lg font-medium text-white` |
| Description | **14px** zinc-400, **8px** below title | `mt-2 text-sm leading-relaxed text-zinc-400` |
| Whole card | `<Link>` to hub | `href="/legal/listener"` \| `href="/legal/minister"` |

| Card | Title | Description | `href` |
| ---- | ----- | ----------- | ------ |
| Listener | Listener | App, account, and listening experience | `/legal/listener` |
| Minister | Minister | Studio, uploads, and creator tools | `/legal/minister` |

---

## D3 — Legal document pages: scrollspy layout

**Normative:** Match [`WhyTroottSection.tsx`](../../../apps/website/components/containers/why-troott/WhyTroottSection.tsx) **grid, sticky nav, scrollspy, and nav row styling** — substitute legal prose for product panels.

### Section shell (document + hub pages)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Padding Y | **80px** → **112px** `lg` | `py-20 sm:py-28` |
| Container | `max-w-7xl` | `container mx-auto max-w-7xl px-4 md:px-6` |
| Overflow | visible (sticky) | `overflow-visible` on section — **no** `overflow-x-hidden` on `<main>` ancestor |

### Page header (full width, above grid)

| Element | Spec | Tailwind |
| ------- | ---- | -------- |
| Eyebrow | `// Legal` · `// Listener` · `// Minister` · or doc name | `font-mono text-[13px] leading-none text-zinc-500` |
| H1 / H2 | Split headline per doc | `mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]` |
| Muted line | e.g. `Privacy Policy` / `Last updated …` | `block text-zinc-500` |
| Header → grid gap | **48px** mobile → **64px** `lg` | `mb-12 sm:mb-16` |

**Example — Privacy Policy:**

| Line | Text |
| ---- | ---- |
| 1 | Your privacy |
| 2 | matters to us. |

### Two-column grid (`lg+`)

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Breakpoint | **1024px+** | `lg:grid` |
| Columns | **240–280px** nav + fluid content | `lg:grid-cols-[minmax(240px,280px)_1fr]` |
| Gap | **48px** / **64px** `xl` | `lg:gap-12 xl:gap-16` |

### Sticky left rail

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Wrapper | full-height grid cell | `relative hidden lg:block` |
| Sticky `top` | **`calc(var(--site-header-height, 4rem) + 1.5rem)`** | inline `style` (same as Why Troott) |
| z-index | **10** | `z-10` |

### Nav row (per item) — **must match Why Troott**

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Row padding | **16px** vertical, **16px** left | `py-4 pl-4` |
| Row border | bottom `white/10` | `border-b border-white/10` |
| Active text | white | `text-white` |
| Inactive text | zinc-500, hover zinc-300 | `text-zinc-500 hover:text-zinc-300` |
| Active left bar | **2px** white | `border-l-2 border-l-white` |
| Inactive left bar | transparent | `border-l-2 border-l-transparent` |
| Icon container | **32×32px**, `rounded-sm` | `size-8 rounded-sm` |
| Icon container default bg | `neutral-50/10` | `bg-neutral-50/10` |
| Icon container active bg | **teal-400** | `bg-teal-400` |
| Icon container hover bg | **teal-500** | `group-hover:bg-teal-500` |
| Icon | **16px**, white on active/hover | `size-4` |
| Label | **14px**, uppercase, wide tracking | `text-sm font-normal uppercase tracking-wide` |
| Focus | ring white/40 | `focus-visible:ring-2 focus-visible:ring-white/40` |

### Right column — stacked sections

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section stack gap | **64px** | `flex flex-col gap-16` |
| Section scroll margin | header offset | `scroll-mt-[calc(var(--site-header-height,4rem)+1.5rem)]` |
| Section eyebrow | mono 11px uppercase zinc-500 | `font-mono text-[11px] uppercase tracking-wider text-zinc-500` |
| Section H2/H3 | **28px** mobile / **30px** `sm+` semibold white | `text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[1.875rem]` |
| Title → body gap | **20px** | `mt-5` |
| Body prose | **15–16px**, zinc-400, **1.65** LH | `text-[15px] leading-[1.65] text-zinc-400 sm:text-base sm:leading-[1.7]` |
| Prose max width | **none** (legal full column) | no `max-w-[28rem]` cap |
| Lists | disc / decimal, **16px** indent | `prose-invert` or explicit `ul`/`ol` styles |

**Reject on legal pages:** product CTA row, screenshot `aspect-[16/10]` blocks, `GetTroottButton`.

### Scrollspy behavior

| Behavior | Spec |
| -------- | ---- |
| Engine | Shared with [`useWhyTroottScrollspy.ts`](../../../apps/website/components/containers/why-troott/useWhyTroottScrollspy.ts) — extract to `useScrollspy` |
| Activation | Reading-line + max-visible fallback ([feat-0004 TECH TR1](../feat-0004/TECH.md)) |
| Click nav | `scrollToSection` with header offset; **500–600ms** programmatic scroll guard |
| Mobile `< lg` | **No sticky nav** — sections flow; optional jump links at top P2 |
| Reduced motion | instant scroll; IO sync remains |

### ASCII (@ 1440px document page)

```text
┌ py-28 ──────────────────────────────────────────────────────────────────┐
│  // Legal                                                                │
│  Your privacy                                                            │
│  matters to us.                                                          │
│                                                                          │
│  ┌─ sticky nav ─────┐  ┌─ section: Introduction ──────────────────────┐ │
│  │ DOCS             │  │  1. Introduction                            │ │
│  │ ● Privacy Policy │  │  prose…                                     │ │
│  │   Terms of Use   │  └─────────────────────────────────────────────┘ │
│  │   Cookies        │  ┌─ section: Data we collect ──────────────────┐ │
│  │   GDPR           │  │  2. Data we collect                         │ │
│  │ ─────────────    │  │  prose…                                     │ │
│  │ IN THIS DOCUMENT │  └─────────────────────────────────────────────┘ │
│  │ ● Introduction   │  … more sections …                              │
│  │   Data we collect│                                                   │
│  └──────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## D4 — Left rail navigation model

Two **nav groups** in one sticky column (desktop):

### Group A — Documents (route links)

Always visible on **listener** and **minister** legal pages. Routes are **audience-scoped** — doc switcher never crosses audiences.

#### Listener

| `navLabel` | Route | Icon (see [R2](#r2--nav-icons)) |
| ---------- | ----- | ------------------------------- |
| Terms of Use | `/legal/listener/terms-of-use` | `RiFileTextLine` |
| Privacy Policy | `/legal/listener/privacy-policy` | `RiShieldUserLine` |
| Cookies | `/legal/listener/cookies` | `RiCookieLine` |
| GDPR | `/legal/listener/gdpr` | `RiDatabase2Line` |

#### Minister (same labels, minister base path)

| `navLabel` | Route | Icon |
| ---------- | ----- | ---- |
| Terms of Use | `/legal/minister/terms-of-use` | `RiFileTextLine` |
| Privacy Policy | `/legal/minister/privacy-policy` | `RiShieldUserLine` |
| Cookies | `/legal/minister/cookies` | `RiCookieLine` |
| GDPR | `/legal/minister/gdpr` | `RiDatabase2Line` |

- Render as **`<Link>`** (not hash scroll).
- **`aria-current="page"`** on active document.
- Same row chrome as scrollspy rows ([D3](#d3--legal-document-pages-scrollspy-layout)).
- **No** `bg-teal-400` active on route group unless current page — use white text + left bar only for current route; section scrollspy uses teal icon box.

### Group B — In this document (scrollspy)

Only on **document pages** (not on `/legal` chooser).

- Separator: **16px** gap + optional `border-t border-white/10` + label `IN THIS DOCUMENT` (`font-mono text-[10px] text-zinc-600 uppercase tracking-wider mb-2`).
- Items: **section anchors** from document data (`id`, `navLabel`).
- **`href="#legal-section-{id}"`** + `scrollToSection` on click.
- **`aria-current="true"`** on active section from scrollspy.

### Hub pages (`/legal/listener`, `/legal/minister`)

Same layout shell as document pages ([D3](#d3--legal-document-pages-scrollspy-layout)) — **no Group B** scrollspy.

| | Listener hub | Minister hub |
| --- | ------------ | ------------ |
| Route | `/legal/listener` | `/legal/minister` |
| Eyebrow | `// Legal` · `// Listener` | `// Legal` · `// Minister` |
| H1 line 1 | `Legal documents` | `Legal documents` |
| H1 line 2 | `for listeners.` | `for ministers.` |
| Left nav | Group A → `/legal/listener/*` | Group A → `/legal/minister/*` |
| Right column | Overview prose (1–3 short sections) | Same structure, minister copy |
| CTA | Optional link to Privacy — P2 | Optional link to Privacy — P2 |

**Cross-audience link (P2):** Footer line “Are you a minister?” → `/legal/minister` (and reverse on minister hub).

---

## D5 — Content model

```ts
type LegalAudience = 'listener' | 'minister';

type LegalDocSlug =
  | 'terms-of-use'
  | 'privacy-policy'
  | 'cookies'
  | 'gdpr';

type LegalSection = {
  id: string;
  navLabel: string;
  eyebrow?: string;
  title: string;
  body: string; // HTML or markdown rendered to prose
};

type LegalDocument = {
  audience: LegalAudience;
  slug: LegalDocSlug;
  label: string;           // page eyebrow fragment
  heading: string;
  headingMuted: string;    // e.g. "Last updated March 2026"
  lastUpdated: string;     // ISO date for metadata + review cadence
  sections: LegalSection[];
  sourceRefs?: string[];   // monorepo paths audited when drafting (see D7) — optional, not rendered
};

type LegalHubContent = {
  audience: LegalAudience;
  heading: string;
  headingMuted: string;
  intro: string;
};
```

**Files:**

```text
_data/legal/
├── types.ts
├── documents.ts                 # doc switcher nav per audience
├── listener/
│   ├── hub.ts
│   ├── terms-of-use.ts
│   ├── privacy-policy.ts
│   ├── cookies.ts
│   └── gdpr.ts
└── minister/
    ├── hub.ts
    ├── terms-of-use.ts
    ├── privacy-policy.ts
    ├── cookies.ts
    └── gdpr.ts
```

**v1 section count per doc:** **4–8** sections (enough to demonstrate scrollspy).

**Authoring rule:** Section titles and body in `_data/legal/**` must be **derived from monorepo product behavior** ([D7](#d7--content-sources-from-monorepo-apps)) — not generic boilerplate. Legal review still required before launch; engineering supplies factual inventory.

---

## D7 — Content sources from monorepo apps

Legal copy must reflect **what Troott actually collects, stores, and exposes** in each client. Use the tables below as the **source-of-truth checklist** when writing `_data/legal/{listener|minister}/*.ts`.

### Platform map

| App | Path | Public URL | Primary audience | Legal docs |
| --- | ---- | ---------- | ---------------- | ---------- |
| Website | `apps/website` | `https://troott.com` | Public marketing | Hosts `/legal/*`; newsletter |
| Mobile | `apps/mobile` | App stores | **Listener** | Links to listener docs |
| Studio | `apps/web` | `https://app.troott.com` | **Minister** (+ creator, admin) | Minister docs; in-app links TBD |
| API | `apps/api` | `https://api.troott.com` | All clients | Data models + processors drive both audiences |

### Audience scope (normative for v1)

| Audience | Product | Definition source | Covers |
| -------- | ------- | ----------------- | ------ |
| **Listener** | Troott mobile app | `apps/api/src/_data/roles.json` (listener), `apps/website/_data/troott/why-troott.ts` | Streaming, library, playlists, onboarding interests, playback |
| **Minister** | Troott Studio (`apps/web`) | `roles.json` (minister), `why-troott.ts` (Studio) | Uploads, ministry profile, ID verification, analytics, team/RBAC |
| **Creator** | Studio short-form (sermonBites) | `roles.json` (creator) | **v1:** covered by **Minister** legal docs unless product splits audience later |

**Marketing one-liners** (hub intro copy):

- Listener — `why-troott.ts` *listen* tab: sermon library, find ministers, listen without ads/clutter.
- Minister — `why-troott.ts` *publish* tab: upload from Studio, manage library, reach listeners.

### Per-app source index

#### `apps/api` — data, auth, processors

| Topic | What legal copy must reflect | Key files |
| ----- | ---------------------------- | --------- |
| Auth | JWT (30-day), Bearer header; OAuth Google/Apple/GitHub | `src/services/token.service.ts`, `src/routes/auth.router.ts`, `docs/adr/0004-token-only-auth-no-refresh-token.md` |
| User PII | Name, email, phone, DOB, gender, country, address, avatar, login history, devices | `src/models/user.model.ts` |
| Listener data | Playlists, library, likes, listening history, searches, followed ministers, interests, payment card tokens (Paystack) | `src/models/core/listener.model.ts`, `src/interfaces/core/listener.interface.ts` |
| Minister data | Ministry profile, HQ address, socials, **government ID images** (NIN, license, passport), verification status | `src/models/core/minister.model.ts`, `src/interfaces/core/minister.interface.ts` |
| Playback analytics | Device type, OS, browser, app version, network, session timestamps | `src/models/core/playback-session.model.ts` |
| Account end | `DELETE /user/deactivate` → `isDeactivated: true` (soft deactivate, not hard delete) | `src/routes/user.router.ts`, `src/controllers/user.controller.ts` |
| Data export | **Not implemented** — document email request process | `specs/api/mobile-flow.md` §11 |
| Storage | AWS S3 + CloudFront (audio, images, documents) | `src/configs/aws.config.ts`, `src/utils/helpers.util.ts` |
| Payments | Paystack subscriptions | `src/dtos/transaction.dto.ts`, `src/configs/seeds/plan.seed.ts` |
| Email | MailerSend / SMTP / Zeptomail | `src/services/email.service.ts` |
| Published sermons | Ministers cannot bin/delete **published** sermons (retention policy) | `src/services/core/sermon.service.ts`, `.cursor/rules/studio-sermon-published-delete-policy.mdc` |
| Legal email templates | Terms update email; placeholder `https://troott.com/terms` | `src/views/emails/legal/terms-and-conditions.pug`, `src/views/preview/preview.router.ts` |

#### `apps/mobile` — listener-facing product

| Topic | What legal copy must reflect | Key files |
| ----- | ---------------------------- | --------- |
| Legal URLs today | `https://www.troott.com/privacy`, `https://www.troott.com/terms` | `components/features/account/about-troott-screen.tsx` |
| Signup consent | “By continuing, you agree…” — Terms of Sale, Terms of Service, Privacy (**links not wired**) | `components/features/auth/TermsConditions.tsx` |
| Account delete UI | “Account scheduled for deletion” — **mismatch:** API only deactivates | `about-troott-screen.tsx` |
| Play Store data worksheet | Email, name, user IDs, photos, interactions, crash logs, device IDs; **no location**; sign-in required | `docs/google-play-store-listing.md` §9 |
| Local storage | Secure storage (Keychain) for JWT; MMKV cache | `api/services/secure-storage.tsx`, `api/services/mmkv-storage.tsx` |
| Permissions | Photos (profile); camera/mic (flagged TODO); push notifications; background audio | `app.json`, `app/user/notifications.tsx` |
| SDKs | Bugsnag (crashes, user id); PostHog when enabled (search/player) | `api/monitoring/bugsnag.ts`, `components/features/search/search.analytics.ts` |
| Onboarding | Favorite ministers, topic interests | `app/(onboarding)/select-interests.tsx` |

#### `apps/web` — minister / studio product

| Topic | What legal copy must reflect | Key files |
| ----- | ---------------------------- | --------- |
| Onboarding PII | Legal name, ministry name, **government ID upload** | `components/shared/get-started/LegalNameInput.tsx`, `VerifyDocument.tsx`, `hooks/app/useDocumentVerification.ts` |
| ID consent copy | “Your ID will be used to verify your personal information” | `VerifyDocument.tsx` |
| Studio features | Sermon upload, analytics, shareable links, team invites | `specs/web/feature/feat-0023/`, `src/hooks/app/useSermon.ts` |
| Terms gate | **No terms checkbox** on web signup (gap vs mobile) | auth/onboarding flows |
| Cookies | `token`, `userId`, `userType`, `userEmail`, `businessType`, `studioCode` (~24h); `sidebar_state` (7d); `x-hit` idempotency — **not httpOnly** | `src/api/services/cookies.ts`, `src/api/services/local-storage.ts`, `components/ui/sidebar.tsx` |
| Account delete | Settings delete → same `DELETE /user/deactivate`; UI says “permanently delete” | `DeleteAccountSection.tsx`, `DeleteAccountDialog.tsx` |
| Observability (prod) | PostHog (session recording), Sentry, Reo — user id + email identified | `PosthogProvider.tsx`, `ErrorLoggingService.ts`, `ObservabilityUserSync.tsx` |

#### `apps/website` — marketing surface

| Topic | What legal copy must reflect | Key files |
| ----- | ---------------------------- | --------- |
| Broken links today | Notion privacy (`/https://…` typo), terms → `/` | `app/siteConfig.tsx`, `components/containers/Footer.tsx` |
| Newsletter | MailerLite — email, name, consent checkbox, country, `user_type` | `app/api/subscribe/route.ts`, `components/NewsletterModal.tsx` |
| Analytics | Vercel Analytics on CTAs | `app/layout.tsx`, hero/download components |
| Contact | `hello@troott.com` | `Footer.tsx` |

### Document section outlines (scrollspy targets)

Each document: **4–8 sections** in `_data/legal/`. Section `id` / `navLabel` / `title` below are **recommended** — adjust after legal review.

#### Listener — Terms of Use

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `acceptance` | Acceptance | Mobile auth `TermsConditions.tsx`; account required (no guest mode — Play Store doc) |
| `the-service` | The service | `why-troott.ts`, Play Store full description |
| `accounts` | Your account | API user model; OAuth providers |
| `subscriptions` | Subscriptions | Paystack plans (`plan.seed.ts`); premium roadmap in Play Store doc |
| `content` | Content | Third-party minister sermons; listener does not upload |
| `termination` | Termination | `DELETE /user/deactivate` — align language with actual behavior ([D7 gaps](#d8--known-gaps-align-before-launch)) |
| `contact` | Contact | `hello@troott.com` |

#### Listener — Privacy Policy

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `overview` | Overview | Troott as listener app; data controller contact |
| `data-we-collect` | Data we collect | `listener.model.ts`, `user.model.ts`, Play Store §9 |
| `how-we-use` | How we use data | Recommendations, playback, library sync |
| `sharing` | Sharing | AWS, Paystack, Bugsnag, PostHog (if enabled) |
| `retention` | Retention | Deactivate flag; no export API yet |
| `your-rights` | Your rights | Link to GDPR page; email `hello@troott.com` for export |
| `children` | Children | Play Store TODO (13+ / 18+) — mark **legal review required** |

#### Listener — Cookies

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `overview` | Overview | Native app vs website |
| `mobile-storage` | App storage | Secure storage + MMKV (not browser cookies) |
| `website` | Website | If user opens troott.com: Vercel Analytics, MailerLite |
| `managing` | Managing preferences | OS settings; unsubscribe newsletter |

#### Listener — GDPR

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `controller` | Data controller | Troott / contact |
| `lawful-bases` | Lawful bases | Contract (account), legitimate interest (analytics/recommendations) |
| `rights` | Your rights | Access, rectification, erasure, portability, object, restrict |
| `exercise-rights` | Exercise your rights | Email process until API export exists (`mobile-flow.md`) |
| `transfers` | International transfers | AWS, US analytics vendors |
| `complaints` | Complaints | Supervisory authority |

#### Minister — Terms of Use

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `acceptance` | Acceptance | Studio at `app.troott.com` |
| `studio-service` | Studio service | Upload, publish, analytics (`feat-0023`) |
| `verification` | Verification | Minister ID verification requirement |
| `your-content` | Your content | Sermon ownership; **published sermon non-deletion** policy |
| `teams` | Teams & access | RBAC, invites (`permissions.json`) |
| `plans` | Plans & billing | Paystack subscription terms |
| `termination` | Termination | Same deactivate endpoint |
| `contact` | Contact | `hello@troott.com` |

#### Minister — Privacy Policy

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `overview` | Overview | Studio + minister account |
| `data-we-collect` | Data we collect | `minister.model.ts` + listener-equivalent user fields |
| `identity-verification` | ID verification | Government ID images; purpose, retention, admin access |
| `sermon-data` | Sermon & analytics | Uploads, playback aggregates, shareable links |
| `sharing` | Sharing | AWS, email providers, PostHog/Sentry/Reo (prod) |
| `retention` | Retention | ID docs post-verification; published sermon retention |
| `your-rights` | Your rights | Link to minister GDPR page |

#### Minister — Cookies

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `overview` | Overview | Studio web app cookies |
| `essential` | Essential cookies | Auth cookies (`cookies.ts` keys table) |
| `preferences` | Preferences | `sidebar_state` |
| `analytics` | Analytics | PostHog / Vercel if minister visits troott.com |
| `managing` | Managing cookies | Browser clear; logout clears session cookies |

#### Minister — GDPR

| Section `id` | `navLabel` | Source topics |
| ------------ | ---------- | ------------- |
| `controller` | Data controller | Same as listener |
| `special-categories` | Sensitive data | ID documents — explicit lawful basis + safeguards |
| `rights` | Your rights | Same rights; minister analytics export permission |
| `processors` | Processors | Extended list (observability stack) |
| `transfers` | Transfers | AWS, US vendors |
| `complaints` | Complaints | Supervisory authority |

### Third-party processors (maintain in copy)

| Processor | Listener surfaces | Minister surfaces | Purpose |
| --------- | ----------------- | ----------------- | ------- |
| AWS (S3 / CloudFront) | Mobile, API | Studio, API | Media storage & delivery |
| MongoDB | API | API | Primary database |
| Redis | API | API | Cache, sessions |
| Paystack | Mobile (subscriptions) | Studio (plans) | Payments |
| Bugsnag | Mobile | — | Crash reporting |
| PostHog | Mobile (optional), — | Studio (prod) | Product analytics |
| Sentry | — | Studio (prod) | Error monitoring |
| Reo | — | Studio (prod) | Observability |
| Vercel Analytics | Website | Website (if minister visits) | Marketing analytics |
| MailerLite | Website newsletter | — | Email marketing |
| Google / Apple / GitHub OAuth | Mobile, API | Studio (if enabled) | Sign-in |
| Email (MailerSend / Zepto / SMTP) | API transactional | API transactional | Account emails |

### URL consolidation (must match after ship)

| URL | Current consumer | feat-0014 target |
| --- | ---------------- | ---------------- |
| `https://www.troott.com/privacy` | Mobile About, Play Store | `/legal/listener/privacy-policy` (redirect `/privacy`) |
| `https://www.troott.com/terms` | Mobile About, Play Store | `/legal/listener/terms-of-use` (redirect `/terms`) |
| Notion privacy | Website footer, `siteConfig` | **Remove** — on-site listener privacy |
| `https://troott.com/terms` | API email preview | Update to `/legal/listener/terms-of-use` |
| Terms of Sale | Mobile auth copy only | **No URL** — legal/product decision (P1) |
| Minister legal | None | `/legal/minister/*` — link from Studio footer/settings P2 |

**Post-ship client updates (separate tasks, tracked here):**

- `apps/mobile` About + `TermsConditions.tsx` → new listener URLs
- `apps/mobile/docs/google-play-store-listing.md` → updated privacy/terms lines
- `apps/website` `siteConfig` + `Footer` + `NewsletterModal` privacy href
- `apps/api` email templates + preview router terms URL

---

## D8 — Known gaps (align before launch)

Copy must **not over-promise** relative to code. Resolve or explicitly disclaim:

| Gap | Evidence | Legal doc action |
| --- | -------- | ---------------- |
| “Deletion” vs deactivate | Mobile/web UI promises deletion; API sets `isDeactivated` | Terms + Privacy: describe deactivation; hard-delete timeline TBD |
| Data export | No self-serve API (`mobile-flow.md` §11) | GDPR: email `hello@troott.com`; do not promise instant export |
| Terms of Sale | Mobile auth references; no public page | Add route or remove from mobile copy |
| Analytics consent | PostHog/Sentry in prod without banner | GDPR lawful basis + product consent decision |
| Creator audience | Third role in API | Minister docs cover creators in v1; note in minister terms |
| ID document sensitivity | Minister verification stores government ID images | Minister privacy: dedicated section with retention/access |
| Newsletter privacy link | `href="#"` today | Wire to `/legal/listener/privacy-policy` |
| `siteConfig.privacy` typo | `/https://troott.notion.site/...` | Replace with on-site URL |

---

## D6 — Legacy URL redirects

| Legacy path | Redirect (308) | Reason |
| ----------- | -------------- | ------ |
| `/privacy` | `/legal/listener/privacy-policy` | Mobile app + Play Store listing |
| `/terms` | `/legal/listener/terms-of-use` | Mobile app About screen |

Implement in `next.config.ts` `redirects` or `middleware`.

---

## Recommendations

### R1 — Page copy (titles)

#### Listener

| Doc | `heading` | `headingMuted` |
| --- | --------- | -------------- |
| Hub | Legal documents | for listeners |
| Terms | Terms of use | for Troott listeners |
| Privacy | Privacy policy | how we handle your data |
| Cookies | Cookie policy | how we use cookies |
| GDPR | GDPR | your data rights |

#### Minister

| Doc | `heading` | `headingMuted` |
| --- | --------- | -------------- |
| Hub | Legal documents | for ministers |
| Terms | Terms of use | for Troott Studio |
| Privacy | Privacy policy | how we handle creator data |
| Cookies | Cookie policy | how we use cookies in Studio |
| GDPR | GDPR | your data rights as a minister |

### R2 — Nav icons

Use `@remixicon/react` — same dependency as Why Troott.

### R3 — Footer & siteConfig

| Link | New `href` |
| ---- | ---------- |
| Privacy | `/legal/listener/privacy-policy` |
| Terms | `/legal/listener/terms-of-use` |

Add footer links: **Cookies**, **Legal** (`/legal`) — P2 if crowded.

Remove Notion external URL from `siteConfig.baseLinks.privacy`.

### R4 — Minister v1

Ship **all five Minister routes** (hub + four docs) on day one — same components and scrollspy as Listener. Section body may read “Content forthcoming” until legal review; structure (≥4 sections per doc) must exist so scrollspy is testable.

---

## Acceptance criteria

### Routes

- [ ] `/legal` chooser with Minister + Listener cards
- [ ] Listener: hub + four document routes live
- [ ] Minister: hub + four document routes live (placeholder copy OK)
- [ ] Minister pages use same layout/scrollspy as Listener
- [ ] `/privacy` and `/terms` redirect to listener docs

### Layout (pixel @ 1440px `lg+`)

- [ ] Grid `lg:grid-cols-[minmax(240px,280px)_1fr]`, gap `xl:gap-16`
- [ ] Sticky nav `top: calc(4rem + 1.5rem)`
- [ ] Nav rows match [D3 nav row table](#nav-row-per-item--must-match-why-troott)
- [ ] Section stack `gap-16`, scrollspy active sync on scroll + click
- [ ] Mobile: flowing sections, no sticky nav

### Content

- [ ] Copy from `_data/legal/` — not hardcoded in page components
- [ ] Each doc has ≥4 scrollspy sections
- [ ] Section outlines match [D7 document tables](#document-section-outlines-scrollspy-targets)
- [ ] Data inventory reflects `apps/api` models (listener + minister)
- [ ] Third-party table matches actual SDKs per [D7 processors](#third-party-processors-maintain-in-copy)
- [ ] Copy aligns with [D8 gaps](#d8--known-gaps-align-before-launch) — no false deletion/export promises
- [ ] `lastUpdated` date on each document (ISO month/year in `headingMuted` or metadata)

### Build

- [ ] `pnpm --filter @troott/website build`

---

## Out of scope (v1)

- PDF download per document
- Version diff / changelog
- Search within legal
- i18n
- Authenticated “accept terms” flow (studio — web app feat)

---

## References

### Layout & UX

- Layout reference: [feat-0004](../feat-0004/PRODUCT.md) scrollspy
- Code reference: [`why-troott/`](../../../apps/website/components/containers/why-troott/)
- Dark-only: [feat-0001](../feat-0001/PRODUCT.md)

### Content sources (monorepo)

| App | Paths |
| --- | ----- |
| API | `apps/api/src/models/user.model.ts`, `core/listener.model.ts`, `core/minister.model.ts`, `src/_data/roles.json`, `src/controllers/user.controller.ts` |
| Mobile | `apps/mobile/docs/google-play-store-listing.md`, `components/features/account/about-troott-screen.tsx`, `components/features/auth/TermsConditions.tsx` |
| Studio | `apps/web/src/api/services/cookies.ts`, `components/shared/get-started/VerifyDocument.tsx`, `src/services/observability/` |
| Website | `apps/website/app/siteConfig.tsx`, `components/containers/Footer.tsx`, `app/api/subscribe/route.ts` |
| Specs | `specs/api/mobile-flow.md` (GDPR §11), `specs/web/feature/feat-0023/` (minister analytics) |
