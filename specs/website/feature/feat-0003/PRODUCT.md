# feat-0003: `GetTroottButton` — smart platform download (navbar)

## Summary

Replace the static navbar **Start listening** control with a **reusable `GetTroottButton`** — platform-aware label, **required platform icon**, optional desktop shortcut badge, and **`get-troott`** link per device.

Pattern reference: [Warp get download](https://app.warp.dev/get_warp?package=dmg) — download control with **text + OS icon**; canonical URL on app host with `package` query parameters.

App: **`apps/website`** (`troott.com`) for the button component; **`apps/web`** (`app.troott.com`) for the **`/get-troott`** redirect handler. Builds on [feat-0002](../feat-0002/PRODUCT.md) navbar. Dark-only UI per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Detection scope](#d1--detection-scope), [Canonical get-troott URL](#d2--canonical-get-troott-url), [Destinations per platform](#d3--destinations-per-platform), [Newsletter modal](#d4--newsletter-modal-vs-store-link), [CTA scope](#d5--cta-scope-v1), [Reusable button + icons](#d6--reusable-gettroottbutton-with-platform-icons), [Store URLs](#d7--store-urls-binding), [Handler delivery](#d8--get-troott-handler-delivery), [Launch order](#d9--launch-order), [SSR label](#d10--ssr-label), [Navbar alignment](#d11--navbar-feat-0002-alignment).

**Paired app-host spec:** [web feat-0035](../../../web/feature/feat-0035/PRODUCT.md) — `/get-troott` redirect handler on `apps/web`.

---

## Assumptions (validate before implement)

1. **Troott ships native mobile only** (Android + iOS). There is **no** native macOS `.dmg` or Windows `.exe` in v1 — but **`package=dmg`** and **`package=exe`** are **implemented** on the get-troott handler and redirect to the web app until installer URLs are configured (Warp-style slots).
2. **Store URLs** are resolved server-side at **`https://app.troott.com/get-troott`** (not hardcoded in the navbar href beyond the get-troott URL + `package` param). Canonical values in [D7](#d7--store-urls-binding).
3. **Marketing site** runs client-side UA detection for **label + icon only**; the button **`href`** always targets **`get-troott`** with the matching `package` query (see D2).
4. **Desktop visitors:** macOS → `package=dmg`, Windows → `package=exe`, Linux / unknown → bare `get-troott` or `package=web`. Handler maps `dmg` / `exe` to web until native installers ship.
5. **Modern browsers only** — no IE11; iPadOS may report as Mac until `maxTouchPoints` check (documented in TECH).

---

## Design decisions

### D1 — Detection scope

| | Detail |
| --- | ------ |
| **Decision** | Detect **Android**, **iOS** (iPhone / iPad / iPod), **macOS**, **Windows**, and **unknown / other** (Linux, smart TV, bots). |
| **Why** | Matches user request and common SaaS landing patterns (Spotify, Discord, Slack). |
| **v1 method** | Client-side UA parsing for **button label + icon**; **`href`** uses [D2 get-troott URL](#d2--canonical-get-troott-url) with `package` query. |
| **Server** | **`app.troott.com/get-troott`** performs the final redirect (UA + `package` param), same role as [Warp `get_warp`](https://app.warp.dev/get_warp?package=dmg). |

### D2 — Canonical get-troott URL

| | Detail |
| --- | ------ |
| **Decision** | All navbar (and future campaign) download CTAs use **`https://app.troott.com/get-troott`** with a **`package`** query parameter — mirroring **`https://app.warp.dev/get_warp?package=dmg`**. |
| **Why** | One stable URL for email, ads, and QR codes; server owns store redirects; marketing site only picks label/icon + `package`. |
| **Host** | **`apps/web`** (`app.troott.com`) — not `troott.com`. |
| **siteConfig key** | `siteConfig.baseLinks.getTroott` → `https://app.troott.com/get-troott` |

**`package` values (v1):**

| `package` | Set by (client) | Server redirect target |
| --------- | --------------- | ------------------------ |
| `android` | Android UA | Google Play ([D7](#d7--store-urls-binding)) |
| `ios` | iOS / iPad UA | App Store ([D7](#d7--store-urls-binding)) |
| `web` | Linux, explicit web campaigns | Web listener (`https://app.troott.com`) |
| `dmg` | macOS UA or client CTA | `TROOTT_DMG_URL` if set, else web app (no native `.dmg` v1) |
| `exe` | Windows UA or client CTA | `TROOTT_EXE_URL` if set, else web app (no native `.exe` v1) |

**Example hrefs (normative):**

```text
https://app.troott.com/get-troott?package=android
https://app.troott.com/get-troott?package=ios
https://app.troott.com/get-troott?package=web
https://app.troott.com/get-troott?package=dmg
https://app.troott.com/get-troott?package=exe
```

**Server behavior (normative):**

1. Read `package` query param if present.
2. Else infer from `User-Agent` (same platform rules as client).
3. `302` redirect to Play Store, App Store, or web app.
4. If store URL not configured → redirect to web app or a minimal “choose platform” HTML page (never 404).

**“Other platforms” link:** `https://app.troott.com/get-troott` (no query) → server shows hub or UA-based redirect.

### D3 — Destinations per platform

| Platform | Button label (compact) | Icon (required) | Button `href` |
| -------- | ---------------------- | --------------- | ------------- |
| Android | Download | `RiGooglePlayFill` | `{getTroott}?package=android` |
| iOS | Download | `RiAppleFill` | `{getTroott}?package=ios` |
| macOS | Download | `RiAppleFill` | `{getTroott}?package=dmg` |
| Windows | Download | `RiWindowsFill` | `{getTroott}?package=exe` |
| Unknown | Download | `RiPlayCircleFill` | `{getTroott}` (no query; server decides) |

Use `labelMode="full"` on `GetTroottButton` for longer copy (see [D6](./PRODUCT.md#d6--reusable-gettroottbutton-with-platform-icons)).

**Package IDs (canonical, resolved on server — not in marketing href):**

- Android application ID: `com.troott.app` (from `apps/mobile/app.json`)
- iOS bundle ID: `com.troott.app` — App Store listing uses Apple-assigned app ID ([D7](#d7--store-urls-binding))

Store URLs live in **`apps/web`** get-troott config/env ([web feat-0035 TECH](../../../web/feature/feat-0035/TECH.md)), not duplicated in navbar JSX.

### D4 — Newsletter modal vs store link

| | Detail |
| --- | ------ |
| **Today** | Navbar **Start listening** opens `NewsletterModal` (`listenerSignup` analytics). |
| **Decision (v1)** | Primary action: navigate to **`get-troott`** (new tab or same tab). **If** `get-troott` / store redirects are not deployed yet → fall back to newsletter modal via `onFallback`. |
| **Recommended default** | Link to `get-troott` once **`apps/web`** handler is live; otherwise modal (preserves waitlist until redirect route ships). |
| **Rejected** | Navbar links directly to Play/App Store URLs — bypasses canonical get-troott URL. |
| **Rejected** | Always `#listener` anchor — no smart download path. |

### D5 — CTA scope (v1)

| In scope | Out of scope (follow-ups) |
| -------- | ------------------------- |
| Navbar desktop + mobile **Start listening** | Hero, footer, CallToAction — reuse shared component in feat-0003b if desired |
| Shared **`GetTroottButton`** (reusable) | Native app universal links / app links verification |
| `siteConfig.baseLinks.getTroott` | Native `.dmg` / `.exe` **binaries** (handler implements `package=dmg` / `package=exe` → web until installers) |
| **`apps/web` `/get-troott` route** ([feat-0035](../../../web/feature/feat-0035/PRODUCT.md)) | A/B testing or geo-based store selection |
| `package=dmg` / `package=exe` client hrefs + handler slots | |
| Optional “Other platforms” → bare `get-troott` | |

### D6 — Reusable `GetTroottButton` with platform icons

| | Detail |
| --- | ------ |
| **Decision** | Ship one **reusable client component** — **`GetTroottButton`** — used first in the navbar, importable anywhere (Hero, footer, CTAs later). **Not** navbar-only markup duplicated in `Navbar.tsx`. |
| **Why** | Same download UX everywhere; one place for platform detection, icons, href, analytics, and fallback. |
| **Reference UI** | Warp-style download control: **text + platform icon** inline; optional **keyboard shortcut** badge on desktop (see anatomy below). |
| **Icons required** | Every resolved platform state **must** render a **platform icon** next to the label — never text-only after hydration. |
| **Icon set** | `@remixicon/react` — same library as feat-0002 navbar. |

**Button anatomy (normative):**

```text
┌─────────────────────────────────────────────┐
│  [ Label ]  [ Platform icon ]  [ ⌘D opt ]   │
└─────────────────────────────────────────────┘
     ↑              ↑                ↑
  e.g. Download   Apple / Play /    kbd pill (desktop
                  Windows / Globe    navbar only; optional)
```

**Layout rules:**

| Rule | Detail |
| ---- | ------ |
| Order | Label → icon → optional shortcut badge (left to right) |
| Gap | `gap-2` between label and icon; icon `size-4` (`16px`) |
| Icon position | **Trailing** after label (matches reference screenshot) |
| Shortcut | Optional `showShortcut` prop — small muted pill with single key (default **`D`**) on **desktop navbar only**; hidden on mobile sheet |
| Fallback (SSR) | Before hydration: label **Download** + `RiPlayCircleFill` icon (same slot/size as final icon) — see [D10](#d10--ssr-label) |
| Variants | `variant="primary"` (default — feat-0002 filled CTA) and `variant="neutral"` (light pill like Warp reference — optional for future hero) |

**Platform → label + icon (compact navbar default):**

| Platform | Label (compact) | Icon (Remix) |
| -------- | --------------- | ------------ |
| Android | Download | `RiGooglePlayFill` |
| iOS | Download | `RiAppleFill` |
| macOS | Download | `RiAppleFill` |
| Windows | Download | `RiWindowsFill` |
| Unknown | Download | `RiPlayCircleFill` |

**Extended labels** (optional `labelMode="full"` prop for Hero / landing sections):

| Platform | Label (full) |
| -------- | ------------ |
| Android | Download for Android |
| iOS | Download for iPhone |
| macOS / Windows | Open in browser |
| Unknown | Get the app |

**Reusability contract:**

- Navbar v1: `<GetTroottButton showShortcut onFallback={openListenerModal} />`
- Hero (future): `<GetTroottButton labelMode="full" className="…" />`
- Component owns: `usePlatform`, href builder, icon map, analytics — consumers pass styling/fallback props only.

**Rejected:** Inline platform `if/else` in `Navbar.tsx` without a shared component.  
**Rejected:** Text-only button without platform icon after hydration.

### D7 — Store URLs (binding)

| | Detail |
| --- | ------ |
| **Decision** | Canonical public store URLs — configured on **`apps/web`** only: |
| **Play Store** | `https://play.google.com/store/apps/details?id=com.troott.app` |
| **App Store** | `https://apps.apple.com/ng/app/troott/id1234567890` |
| **Web app** | `https://app.troott.com` |
| **Note** | Replace App Store ID in env when Apple assigns production listing ID if different from `id1234567890`. |

### D8 — get-troott handler delivery

| | Detail |
| --- | ------ |
| **Decision** | **v1:** `apps/web/public/get-troott.html` + hosting rule so **`GET /get-troott`** serves redirect logic without SPA router. |
| **Follow-up** | Coolify/Traefik/nginx **`302`** map with same URL matrix — no marketing URL changes. |
| **Spec** | [web feat-0035 TECH](../../../web/feature/feat-0035/TECH.md) |

### D9 — Launch order

| | Detail |
| --- | ------ |
| **Decision** | Ship **`apps/web` Task 6** (get-troott handler) **before** enabling live get-troott links on website. |
| **Website default** | `getTroottEnabled={false}` (or env `NEXT_PUBLIC_GET_TROOTT_ENABLED=false`) until handler verified on staging/production. |
| **Fallback** | Newsletter modal via `onFallback` when flag is false — preserves waitlist path. |

### D10 — SSR label

| | Detail |
| --- | ------ |
| **Decision** | SSR + pre-hydration label is **Download** (not “Get the app”) for stable layout; unknown post-hydration also **Download** + `RiPlayCircleFill`. |
| **Why** | Minimizes CLS; compact label matches all platform branches. |
| **aria-label** | Still uses full platform string (“Download Troott for iPhone”). |

### D11 — Navbar feat-0002 alignment

| | Detail |
| --- | ------ |
| **Decision** | While wiring feat-0003, restore feat-0002 navbar contract: **Login** label (not “Request Demo”), **Upload sermons** CTA visible (uncomment if commented). |
| **Scope** | Same PR as `GetTroottButton` or immediately before — avoids shipping smart download on a regressed navbar. |

---

## Problem

| Area | Today | User impact |
| ---- | ----- | ----------- |
| Navbar CTA | Static “Start listening” + play icon; opens newsletter modal | Mobile visitors don’t go straight to Play / App Store |
| Hero / other CTAs | `#listener` anchor or modal | Inconsistent entry paths |
| Store URLs | Not centralized | Play/App Store targets must live on get-troott server |
| Smart URL | None | Need `app.troott.com/get-troott?package=…` like Warp |
| Platform | No UA detection | Same CTA on Android phone and Windows desktop |

---

## User stories

1. **As an Android visitor**, I see **Download** with the **Google Play icon** and tap through to **`get-troott?package=android`**.
2. **As an iPhone visitor**, I see **Download** with the **Apple icon** and tap through to **`get-troott?package=ios`**.
3. **As a Mac visitor**, I see **Download** with the **Apple icon** → **`get-troott?package=dmg`**; **Windows** shows the **Windows icon** → **`get-troott?package=exe`** (handler lands on web app until installers exist).
4. **As any visitor**, if get-troott is not live yet, I still get a working path (modal), not a 404.
5. **As a visitor on the wrong detection**, I can open **`get-troott`** without `package` or use **Other platforms**.
6. **As a developer**, I import **`GetTroottButton`** in navbar, hero, or footer without reimplementing detection or icons.

---

## Reference UX (normative)

Warp-style control (platform icon **required** after label):

```text
Desktop navbar (example — macOS Safari user agent):

  [ Login ]  ┌──────────────────────────────┐
             │ Download  [Apple]        [D] │  → get-troott?package=dmg
             └──────────────────────────────┘
                    ↑           ↑          ↑
                 label      icon      shortcut (desktop only)


Android Chrome:

  ┌──────────────────────────────┐
  │ Download  [Google Play]  [D] │  → get-troott?package=android
  └──────────────────────────────┘


Mobile sheet (example — iOS Safari):

  ┌────────────────────────────┐
  │ Download  [Apple]          │  (no shortcut badge on mobile)
  └────────────────────────────┘
  Other platforms ›


SSR / before hydrate:

  ┌────────────────────────────┐
  │ Download  [Play]           │
  └────────────────────────────┘
```

Visual weight (primary variant): feat-0002 filled CTA — `h-10`, `rounded-md`, icon **`size-4`** trailing label, `inline-flex items-center gap-2`.

---

## Success criteria

- [ ] **`GetTroottButton`** is a reusable export from `@/components/ui/get-troott-button` (or `@/components/get-troott-button`).
- [ ] Navbar CTA **`href`** is `{getTroott}?package={android|ios|dmg|exe|web}` per detected platform.
- [ ] **`https://app.troott.com/get-troott`** redirects correctly for each `package` value including **`dmg`** / **`exe`** → web until installers ([feat-0035](../../../web/feature/feat-0035/TECH.md)).
- [ ] Every hydrated platform state shows **label + platform icon** (never text-only).
- [ ] Icon swaps with platform without layout jump (`min-width` or stable label **Download** where possible).
- [ ] Optional desktop **shortcut badge** (`D`) when `showShortcut` is true.
- [ ] Unknown / SSR → **Download** + play icon until platform resolves ([D10](#d10--ssr-label)).
- [ ] Navbar matches feat-0002: **Login** + **Upload sermons** ([D11](#d11--navbar-feat-0002-alignment)).
- [ ] `getTroottEnabled` false until handler verified ([D9](#d9--launch-order)).
- [ ] Analytics event fires per platform via `@vercel/analytics` `track`.
- [ ] Accessible: `aria-label` includes platform (“Download Troott for iPhone”).
- [ ] feat-0002 decisions preserved: Login visible; no scroll-collapse of CTAs.

---

## Closed decisions (formerly open questions)

| ID | Decision |
| -- | -------- |
| Q1 | Play Store: `https://play.google.com/store/apps/details?id=com.troott.app` — [D7](#d7--store-urls-binding) |
| Q2 | App Store: `https://apps.apple.com/ng/app/troott/id1234567890` — [D7](#d7--store-urls-binding) |
| Q3 | Hero reuse: **No** in v1 — navbar only; component ready for feat-0003b |
| Q4 | “Other platforms”: bare **`get-troott`** (no `troott.com/download` duplicate) |
| Q5 | Handler on Vite SPA: **`get-troott.html` v1** — [D8](#d8--get-troott-handler-delivery), [feat-0035 TECH](../../../web/feature/feat-0035/TECH.md) |

## Additional recommendations (implementer checklist)

| # | Recommendation | Rationale |
| - | -------------- | --------- |
| R1 | Verify `@remixicon/react` exports (`RiGooglePlayFill`, `RiWindowsFill`, etc.) before coding — substitute closest fill icon if renamed | Avoid build break on icon import |
| R2 | Add `NEXT_PUBLIC_GET_TROOTT_ENABLED` env on website; default **`false`** until Task 6 passes curl QA | Prevents 404/SPA shell for campaign links |
| R3 | **`target="_blank"`** + `rel="noopener noreferrer"` on all get-troott links | Store / app opens without losing marketing tab |
| R4 | Unit-test `detectPlatform()` with fixture UA strings (TECH) | Cheap regression guard |
| R5 | Optional **`D`** shortcut: `keydown` listener only when `showShortcut` and not focused in input | Warp parity without stealing form keys |
| R6 | Analytics: platform-specific events + retain `listenerSignup` when modal fallback fires | Funnel visibility during rollout |
| R7 | Document App Store ID update path in `apps/mobile/docs/` when production ID differs from placeholder | Single source for store ops |
| R8 | When `.dmg` / `.exe` ship later, set `TROOTT_DMG_URL` / `TROOTT_EXE_URL` on app host only — no website redeploy | Handler owns redirect targets |

---

## Related

- Navbar: [feat-0002 PRODUCT](../feat-0002/PRODUCT.md)
- Warp reference: [app.warp.dev/get_warp?package=dmg](https://app.warp.dev/get_warp?package=dmg)
- App host / redirect handler: [web feat-0035](../../../web/feature/feat-0035/PRODUCT.md) → `app.troott.com`
- Mobile package: `apps/mobile/app.json` → `com.troott.app`
- Play listing doc: `apps/mobile/docs/google-play-store-listing.md`
- Site config: `apps/website/app/siteConfig.tsx`
