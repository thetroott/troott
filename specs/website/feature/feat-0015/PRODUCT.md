# feat-0015: Audience landing pages — `/listener` and `/minister`

## Summary

Add **dedicated marketing homepages** for each Troott audience:

1. **`/listener`** — mobile app story, get-the-app CTAs, listening value props.
2. **`/minister`** — Studio story, publish/manage CTAs, ministry value props.

Replaces homepage hash anchors (`#listener`, `#minister`) as the **canonical** nav targets for audience-specific journeys. The main homepage (`/`) remains the combined funnel.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Routes](#d1--routes), [Page shell](#d2--page-shell-v1), [Listener page](#d3--listener-page-content), [Minister page](#d4--minister-page-content), [Nav & redirects](#d5--nav-siteconfig--redirects).

**Recommendations:** [R1 Follow-up sections](#r1--follow-up-sections-out-of-v1), [R2 Analytics](#r2--analytics).

---

## Assumptions (specify phase)

1. **v1** ships a **single-scroll landing** per audience (hero + value props + cross-link) — not a full duplicate of the homepage section stack.
2. Root layout keeps **global** `DownloadsSection` + `Footer` (listener page benefits from downloads; minister page still shows app download strip).
3. Minister primary CTA targets **Troott Studio** (`siteConfig.baseLinks.studio`); listener primary CTA uses **`GetTroottButton`** ([feat-0003](../feat-0003/PRODUCT.md)).
4. Legal docs stay under `/legal/{audience}` ([feat-0014](../feat-0014/PRODUCT.md)) — not embedded on these pages in v1.
5. No auth gate — public marketing pages.

Correct product if any assumption is wrong before implementation.

---

## Problem

| Today | Gap |
| ----- | --- |
| Footer and nav link to **`#listener`** / **`#minister`** on homepage | Deep links break when sections reorder; no shareable audience URL |
| `Menu.tsx` points to **`/listeners`** / **`/ministers`** (plural) | Routes do not exist — 404 |
| Minister story lives in `Mission` (`id="minister"`); listener in `TextSection1` (`id="listener"`) | Audience content is buried mid-scroll on `/` |
| Product dropdown “For listeners” / “Ministers & preachers” use hash links | No dedicated SEO landing per audience |

**Goal:** First-class **`/listener`** and **`/minister`** routes with audience-tailored v1 homepages and updated site-wide links.

---

## D1 — Routes

| Route | Page | Primary CTA |
| ----- | ---- | ----------- |
| `/listener` | Listener landing | Get Troott (app) |
| `/minister` | Minister landing | Open Studio |

**URL rules:**

- Singular segment: `listener` \| `minister` (matches legal audience segment).
- Kebab-case only; no trailing slash requirement.

```text
/
├── /listener          # listener landing (v1)
└── /minister          # minister landing (v1)
```

**Not in v1:** `/listeners`, `/ministers` as primary URLs — redirect to singular ([D5](#d5--nav-siteconfig--redirects)).

---

## D2 — Page shell (v1)

Shared layout for both audience pages.

### Document

| Token | Value |
| ----- | ----- |
| File | `app/listener/page.tsx`, `app/minister/page.tsx` |
| Wrapper | `<main className="flex flex-col">` |
| Metadata | Per-audience `title` + `description` (see D3, D4) |

### Hero section

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section padding top | clears fixed nav | `pt-14 md:pt-32` |
| Section padding bottom | **64px** → **96px** `lg` | `pb-16 lg:pb-24` |
| Container | `max-w-7xl` | `container mx-auto max-w-7xl px-4 md:px-6` |
| Content max width | **640px** centered | `mx-auto max-w-[640px] text-center` |
| Eyebrow | `// Listener` or `// Minister` | `font-mono text-[13px] leading-none text-zinc-500` |
| Eyebrow → H1 | **20px** | `mt-5` |
| H1 | **40px** mobile / **48px** `lg`, semibold, split white + zinc-500 lines | `text-[2.5rem] lg:text-5xl font-semibold leading-[1.05] tracking-[-0.03em]` |
| H1 → subtext | **24px** | `mt-6` |
| Subtext | **16px** → **18px** `md`, zinc-400 | `text-base md:text-lg leading-relaxed text-zinc-400` |
| Subtext → CTAs | **32px** | `mt-8` |
| CTA row | wrap, center | `flex flex-wrap items-center justify-center gap-4` |

### Value props block

| Token | Value | Tailwind / CSS |
| ----- | ----- | -------------- |
| Section padding Y | **80px** → **112px** `lg` | `py-20 lg:py-28` |
| Background | subtle lift | `bg-[#0d0d0d]` |
| Grid | 1 col → **3 col** `md+` | `grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6` |
| Card border | white/10 | `border border-white/10 rounded-xl p-6` |
| Title | **18px** white medium | `text-lg font-medium text-white` |
| Body | **14px** zinc-400, **8px** below title | `mt-2 text-sm leading-relaxed text-zinc-400` |

### Cross-audience link

| Token | Value |
| ----- | ----- |
| Placement | Below value props, centered |
| Copy pattern | “Looking for {other audience}? **{link}**” |
| Link | `/minister` from listener page; `/listener` from minister page |
| Style | zinc-400 text, white underline link |

---

## D3 — Listener page content

### Metadata

| Field | Value |
| ----- | ----- |
| `title` | `Troott for Listeners \| Find and listen to sermons` |
| `description` | `Discover sermons from your favourite ministers. Listen ad-free on iOS and Android, save teachings, and share with friends and family.` |

### Hero

| Element | Copy |
| ------- | ---- |
| Eyebrow | `// Listener` |
| H1 line 1 | `Every sermon you love,` |
| H1 line 2 (muted) | `in your pocket.` |
| Subtext | Find powerful messages from ministers you trust. Listen anytime, share with friends and family, and stay rooted in God's Word — ad-free and organised. |
| Primary CTA | **Get Troott** — `GetTroottButton` with newsletter fallback |
| Secondary CTA | **For ministers** → `/minister` (outline button) |

### Value props (3 cards)

| Title | Description |
| ----- | ----------- |
| Discover | Follow ministers and explore teachings by topic — old favourites and new releases in one place. |
| Listen anywhere | Stream or download on iOS and Android. Pick up where you left off across devices. |
| Share easily | Send a sermon to family or your small group without leaving the app. |

### Cross-link

`Publishing sermons? **Troott Studio for ministers** →` `/minister`

---

## D4 — Minister page content

### Metadata

| Field | Value |
| ----- | ----- |
| `title` | `Troott Studio for Ministers \| Publish and grow your reach` |
| `description` | `Upload sermons, manage your library, and help more people hear the Gospel. Troott Studio is built for ministers, preachers, and ministry teams.` |

### Hero

| Element | Copy |
| ------- | ---- |
| Eyebrow | `// Minister` |
| H1 line 1 | `Disciple more people` |
| H1 line 2 (muted) | `through your sermons.` |
| Subtext | Reach hungry hearts ready to listen. Upload once, distribute everywhere, and build disciples — not just listeners — without algorithm noise or clutter. |
| Primary CTA | **Open Studio** → `siteConfig.baseLinks.studio` (external, new tab) |
| Secondary CTA | **Request demo** → `siteConfig.baseLinks.requestDemo` when set; else omit in v1 |

### Value props (3 cards)

| Title | Description |
| ----- | ----------- |
| Publish once | Upload audio from Studio. Troott handles processing, hosting, and delivery to listeners on mobile and web. |
| Grow your library | Organise series, update metadata, and keep your congregation's teachings in one trusted place. |
| Reach further | Share a public profile and let listeners follow your ministry from anywhere in the world. |

### Cross-link

`Just want to listen? **Get Troott for listeners** →` `/listener`

---

## D5 — Nav, siteConfig & redirects

### `siteConfig.baseLinks` (normative)

| Key | Old (v0) | New (v1) |
| --- | -------- | -------- |
| `listeners` | `#listener` | `/listener` |
| `ministers` | `#minister` | `/minister` |
| `requestDemo` | `#minister` fallback | unchanged env; fallback **`/minister`** |

### Footer product links

| Link | `href` |
| ---- | ------ |
| Ministers | `/minister` |
| Listeners | `/listener` |

Homepage section anchors `id="minister"` / `id="listener"` on `Mission` / `TextSection1` **may remain** for backward compatibility on `/` — nav/footer no longer point to them.

### Redirects (`next.config.ts`)

| Source | Destination | Permanent |
| ------ | ----------- | --------- |
| `/listeners` | `/listener` | yes |
| `/ministers` | `/minister` | yes |

---

## R1 — Follow-up sections (out of v1)

| Follow-up | Description |
| --------- | ----------- |
| feat-0015b | Reuse homepage sections (Benefits, App showcase, FAQ subset) per audience |
| feat-0015c | Audience-specific hero imagery / Studio screenshot on minister page |
| feat-0015d | Hide or slim `DownloadsSection` on `/minister` via layout segment |

---

## R2 — Analytics

| Event | When |
| ----- | ---- |
| `listenerSignup` | Listener hero Get Troott fallback (newsletter modal) |
| `ministerSignup` | Minister hero secondary actions that open minister newsletter modal (if wired) |

---

## Acceptance criteria (v1)

- [ ] `/listener` and `/minister` render without error in `pnpm dev:website`.
- [ ] Each page has unique metadata title and description.
- [ ] Listener primary CTA uses `GetTroottButton`; minister primary CTA opens Studio URL.
- [ ] Three value-prop cards per page; cross-link to the other audience.
- [ ] `siteConfig.baseLinks.listeners` → `/listener`, `ministers` → `/minister`.
- [ ] Footer Ministers/Listeners links updated.
- [ ] `/listeners` and `/ministers` redirect to singular routes.
- [ ] `pnpm --filter @troott/website build` passes.

---

## Related

- [feat-0014 Legal](../feat-0014/PRODUCT.md) — `/legal/listener`, `/legal/minister`
- [feat-0003 Get Troott button](../feat-0003/PRODUCT.md)
- [feat-0012 Audience story](../feat-0012/PRODUCT.md) — combined homepage narrative
- [`siteConfig.tsx`](../../../apps/website/app/siteConfig.tsx)
