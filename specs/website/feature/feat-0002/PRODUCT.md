# feat-0002: Marketing navbar — Pacepard-style dropdown navigation

## Summary

Replace the flat Troott marketing navbar (`components/containers/Navbar.tsx`) with a **Pacepard-inspired** header: sticky bar, **Radix NavigationMenu** dropdowns on desktop, accordion mobile menu, and scroll-aware CTAs.

Navigation content is **Troott-specific** (listeners, ministers, FAQs, social) but **layout and interaction** follow the reference UI (Warp/Pacepard screenshots): simple product dropdown, two-column “Solutions” mega panel with icons, resources dropdown, and direct links.

App: **`apps/website`** (`troott.com`). Dark-only UI per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Studio URL](#d1--studio-url), [Login in v1](#d2--login-in-v1-not-omitted), [Scroll CTA behavior](#d3--scroll-cta-behavior).

---

## Design decisions

These three items were evaluated against the Pacepard reference. **Troott choices are binding for v1.**

### D1 — Studio URL

| | Detail |
| --- | ------ |
| **Decision** | All “open Troott Studio / app” links use **`https://app.troott.com`** via `siteConfig.baseLinks.studio`. Login uses **`https://app.troott.com/login`** via `siteConfig.baseLinks.login`. |
| **Why** | Marketing (`troott.com`) and Studio (`app.troott.com`) are separate apps. One canonical URL avoids drift between navbar, Product dropdown, and CTAs. |
| **Where used** | Product dropdown → “Troott Studio”; any external app link in `_data/troott/navigation.ts`. |
| **Not in v1** | `NEXT_PUBLIC_STUDIO_URL` env override — add only if staging needs a different Studio host. |
| **Source of truth** | [`apps/website/app/siteConfig.tsx`](../../../apps/website/app/siteConfig.tsx) |

```ts
baseLinks: {
  login: 'https://app.troott.com/login',
  studio: 'https://app.troott.com',
}
```

### D2 — Login in v1 (not omitted)

| | Detail |
| --- | ------ |
| **Decision** | **Include Login in v1.** Do **not** defer, omit, or comment out the Login control. |
| **Pacepard reference** | Header `Link` to `/login` (same-site auth). |
| **Troott implementation** | External link to Studio: `siteConfig.baseLinks.login`. Label: **Login**. Style: link/ghost button (Pacepard pattern). |
| **Rejected alternative** | “Omit Login until Studio is marketed from www” — rejected; existing studio users must reach login from every page. |
| **Scope** | Desktop header **and** mobile sheet. |

### D3 — Scroll CTA behavior

| | Detail |
| --- | ------ |
| **Pacepard pattern (reference only)** | When `scrollY > 10`: hide Login and secondary actions; show **one** primary CTA (e.g. “Get Started”). Reduces sticky-header clutter while scrolling. |
| **Troott decision (v1)** | **Do not** use Pacepard scroll-collapse. **Login**, **Start listening**, and **Upload your sermons** stay visible at **all** scroll positions. |
| **Why** | Product requires minister + listener paths and Studio login always reachable; collapsing hides two of three intentional entry points. |
| **Implementation** | No `{!scrolled && (...)}` wrapper around header actions. `scrolled` state may still drive mobile menu close or header chrome only. |
| **Future** | A compact scroll variant may be a separate feat if layout overflows on narrow desktop; out of scope for feat-0002. |

```text
Pacepard (not Troott v1):
  top:    [ Login ]  [ Get Started ]  [ … ]
  scroll:              [ Get Started ]

Troott v1 (required):
  top:    [ Login ]  [ Start listening ]  [ Upload your sermons ]
  scroll: [ Login ]  [ Start listening ]  [ Upload your sermons ]
```

---

## Problem

| Area | Today | User impact |
| ---- | ----- | ----------- |
| Desktop nav | Three flat anchors (Listeners, Ministers, FAQs) | No grouping; hard to scale links |
| Mobile nav | Full-screen overlay with dividers | Works but unlike reference accordion + tagline pattern |
| Header chrome | Floating pill (`fixed inset-x-3 top-4`, rounded) | Different from sticky full-width bar + border |
| CTAs | Single “Start listening” | No Login, no minister CTA in header |
| Data | Links inline in component + footer duplicate | Drift between nav and footer |

---

## Reference UI (normative interaction)

Adapt from Pacepard / Warp marketing nav (user-provided screenshots + component):

| Pattern | Desktop | Mobile |
| ------- | ------- | ------ |
| **Products** | Trigger opens panel; rows = title + description | Accordion section; nested links in muted card |
| **Solutions** | Trigger opens **two-column** panel: section labels (`USE CASES`, `AUDIENCE`) + icon rows | Same accordion pattern as Products |
| **Resources** | Single-column dropdown | Accordion |
| **Direct link** | Plain `Link` (e.g. Pricing → FAQs for v1) | Plain row |
| **Header** | Sticky top, `backdrop-blur`, bottom border | Hamburger → full-height sheet |
| **Scroll** | Close mobile menu on scroll | Close menu on scroll |
| **CTAs** | **Login** (link) + **Start listening** + **Upload your sermons** (two buttons) | Same three actions in mobile sheet |

**Not copied verbatim:** Pacepard logo, `/learn`, Calendly, `hello@pacepard.com`, light mobile sheet (`bg-white`). Troott uses dark sheet per feat-0001. Troott **Login** points to Studio (`siteConfig.baseLinks.login`), not Pacepard `/login`.

---

## Information architecture

### Top-level items

| Label | Type | Notes |
| ----- | ---- | ----- |
| **Product** | Dropdown | Troott surfaces |
| **Solutions** | Mega dropdown (2 columns) | Use cases + audience |
| **Resources** | Dropdown | Help + social |
| **FAQs** | Direct link | `#faqs` |

### Product dropdown

| Title | Description | Href |
| ----- | ----------- | ---- |
| Troott Mobile | Listen to sermons on iOS and Android | `#listener` |
| Troott Studio | Upload and manage sermons for your ministry | `siteConfig.baseLinks.studio` (external, `https://app.troott.com`) |
| For listeners | Discover, save, and share teachings | `#listener` |

### Solutions mega menu

**Column A — USE CASES**

| Title | Description | Href | Icon (Lucide) |
| ----- | ----------- | ---- | ------------- |
| Personal devotion | Build a daily listening habit | `#listener` | `Headphones` |
| Small groups | Share teachings with your group | `#listener` | `Users` |
| Church library | One place for your congregation’s sermons | `#minister` | `Library` |
| Share with family | Send messages to friends and family | `#listener` | `Share2` |

**Column B — AUDIENCE**

| Title | Description | Href | Icon |
| ----- | ----------- | ---- | ---- |
| Ministers & preachers | Upload and reach listeners worldwide | `#minister` | `Mic` |
| Listeners | Find your favourite ministers | `#listener` | `PlayCircle` |
| Churches & ministries | Scale sermon distribution | `#minister` | `Building2` |

Icons sit in a small bordered square (reference: Warp Solutions rows).

### Resources dropdown

| Title | Description | Href |
| ----- | ----------- | ---- |
| FAQs | Common questions about Troott | `#faqs` |
| Contact | Email the team | `mailto:hello@troott.com` |
| X (Twitter) | Follow @thetroott | `https://x.com/thetroott` (external) |
| LinkedIn | Company updates | `https://www.linkedin.com/company/troott` (external) |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-N01 | Visitor (desktop) | Grouped nav with descriptions | I understand Product vs Solutions quickly |
| UC-N02 | Visitor (mobile) | Accordion sections | I can browse without clutter |
| UC-N03 | Listener | “Start listening” always reachable | I can join early access from any page |
| UC-N04 | Minister | “Upload your sermons” in header | I find the studio path without hunting |
| UC-N05 | Returning visitor | Same links as footer anchors | Nav and footer stay consistent |
| UC-N06 | Existing studio user | **Login** in the header | I can open Troott Studio without hunting |
| UC-N07 | Minister (mobile) | **Upload your sermons** in the mobile sheet | Same CTAs as desktop |

---

## Required behavior

### B1 — Desktop navigation

1. Logo links to `/` (`TroottLogo`, not Pacepard SVG).
2. **Product**, **Solutions**, **Resources** use `@/components/ui/navigation-menu` (already in repo).
3. **Solutions** panel width ~560–640px; two columns with vertical divider; section headers uppercase muted (`USE CASES`, `AUDIENCE`).
4. Each dropdown row: optional icon box + title + description; hover slide/focus states per reference.
5. **FAQs** is a top-level link (no dropdown).
6. Active route: muted text when `pathname === href` (hash links: optional no active state).

### B2 — Mobile navigation

7. Hamburger animates to X; opens full-viewport overlay (`100dvh`), **dark** background (`bg-neutral-950` / `bg-background`).
8. Accordion per dropdown; `ChevronRight` rotates when open.
9. Closing: tap link, tap outside, resize to `lg+`, or **scroll** (close menu + reset accordion).
10. Footer block in sheet: tagline + “Follow us” + X / LinkedIn (match footer URLs).

### B3 — Header chrome

11. **Sticky** `top-0 z-50`, full width — replace floating pill layout.
12. `bg-background/70 backdrop-blur-md border-b border-border/70`.
13. Max width container aligned with site (`max-w-7xl` or existing marketing container).

### B4 — Header actions (required — do not omit)

The right side of the desktop header **must always include all three** actions below. They are **in scope for v1** and must **not** be dropped, commented out, or deferred.

#### 1. Login (link)

14. **Label:** `Login`
15. **Href:** `siteConfig.baseLinks.login` → `https://app.troott.com/login`
16. **Style:** Text/link button (`Button variant="link"` or ghost) — Pacepard reference pattern
17. **Behavior:** Opens Studio login in same tab or new tab (match current `Navbar.tsx`: `target="_blank"` + `rel="noopener noreferrer"` acceptable)
18. **Visible:** Desktop `lg+`; also in **mobile sheet** as a prominent text link or button row

#### 2. Start listening (primary button)

19. **Label:** `Start listening`
20. **Action:** Opens `NewsletterModal` with `user_type='listener'`
21. **Analytics:** `track('listenerSignup')`
22. **Style:** Primary filled button (foreground on background per Pacepard “Get Started”)

#### 3. Upload your sermons (secondary button)

23. **Label:** `Upload your sermons`
24. **Action:** Opens `NewsletterModal` with `user_type='minister'`
25. **Analytics:** `track('ministerSignup')`
26. **Style:** Outline or secondary button — visually distinct from Start listening

#### Layout order (desktop, left → right in action group)

```text
[ Login ]  [ Start listening ]  [ Upload your sermons ]
```

#### Scroll behavior

27. Per [D3 — Scroll CTA behavior](#d3--scroll-cta-behavior): **all three actions remain visible** at every scroll position.

#### Mobile sheet

28. Below nav accordion (or fixed footer block): repeat **Login**, **Start listening**, and **Upload your sermons** — same behavior as desktop (link vs modal).
29. Closing mobile menu after Login navigation is optional; closing after modal open is optional.

### B5 — Data & reuse

30. Navigation tree lives in **`apps/website/_data/troott/navigation.ts`** (typed export `NavigationItems`).
31. Studio hrefs in navigation data **must** import from `siteConfig.baseLinks.studio`, not hard-coded strings.
32. Footer may import shared link groups later; v1 may duplicate minimal hrefs — **must match** `#listener`, `#minister`, `#faqs` and social URLs in `Footer.tsx`.

### B6 — Theming (feat-0001)

33. No light mobile sheet; no `@pacepard/ui` imports — use `@/lib/utils` `cx`.
34. All surfaces use dark tokens (`background`, `foreground`, `muted-foreground`, `border`).

---

## Non-goals

- Pacepard-only paths: `/learn`, `/register`, in-app `/login` on marketing domain (Troott uses **external** Studio login URL).
- GitHub star badge, “Contact sales”, Enterprise tier.
- New marketing pages for each dropdown row (anchors and external studio URL only).
- i18n.
- Replacing footer layout in this feat.

---

## Acceptance criteria

1. Desktop: Product, Solutions (2-col), Resources dropdowns open and link correctly.
2. Mobile: accordion matches desktop link set; menu closes on link click and scroll.
3. **Login**, **Start listening**, and **Upload your sermons** all work on desktop and mobile; newsletter modal opens for both CTAs with correct `user_type`.
4. Header is sticky full-width dark bar (not floating pill).
5. No `@pacepard/ui` dependency; builds with `@troott/website` only.
6. Keyboard: Radix navigation menu roving focus works on desktop.
7. Visual QA at `375px`, `768px`, `1280px` — no light flash, no horizontal overflow on Solutions panel.
8. `NavigationItems` is the single source for nav labels/hrefs used by navbar.
9. At `scrollY > 200`, Login + both CTA buttons still visible on desktop ([D3](#d3--scroll-cta-behavior)).
10. Product dropdown “Troott Studio” href equals `siteConfig.baseLinks.studio` ([D1](#d1--studio-url)).
11. Login control present on desktop and mobile ([D2](#d2--login-in-v1-not-omitted)).

---

## Open questions (resolve before or during implementation)

| # | Question | Default if unresolved |
| - | -------- | --------------------- |
| Q1 | Login opens same tab vs new tab | Match current navbar: new tab |
| Q2 | Port Pacepard `Background` wrapper for mobile sheet? | Inline div + gradient optional; no new dep |

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Files, types, component API, migration steps |
| [feat-0001 PRODUCT](../feat-0001/PRODUCT.md) | Dark-only requirement |
| [`siteConfig.tsx`](../../../apps/website/app/siteConfig.tsx) | Site name, base URLs |
| [`Footer.tsx`](../../../apps/website/components/containers/Footer.tsx) | Link parity |
