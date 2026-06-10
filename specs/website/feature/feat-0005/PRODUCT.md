# feat-0005: Homepage — “Get Troott today” downloads grid

## Summary

Add a Warp-style **All Downloads** section to the marketing homepage: eyebrow label, headline, optional subtext, and a **three-column platform grid** (iOS, Android, Web) with large primary download buttons, secondary store/link rows, and **copy-to-clipboard** canonical URLs.

**Design reference:** [Warp “All Downloads”](https://www.warp.dev/) — “ALL DOWNLOADS” / “Get Warp today” with Mac, Linux, Windows columns, cream CTA tiles, dark command pills, and architecture sub-rows (see `./assets/warp-all-downloads.png`).

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md). Reuses [feat-0003](../feat-0003/PRODUCT.md) **`get-troott`** URLs and **`GetTroottButton`** patterns — this feat is the **full-page download hub**, not the navbar chip alone.

**Normative decisions:** [Placement](#d1--section-placement), [Platform columns](#d2--platform-columns-v1), [Primary CTAs](#d3--primary-download-ctas), [Secondary rows](#d4--secondary-rows--copy-link), [Visual fidelity](#d5--visual-fidelity-vs-warp-reference).

**Recommendations:** [R1 Copy](#r1--copy), [R2 Troott vs Warp mapping](#r2--warp--troott-mapping), [R3 CTAs & links](#r3--ctas--get-troott), [R4 Layout & responsive](#r4--layout--responsive), [R5 Integration with feat-0003](#r5--integration-with-feat-0003), [R6 Anchor & SEO](#r6--anchor--seo), [R7 Closed copy & UI](#r7--closed-copy--ui-decisions), [R8 feat-0003 alignment](#r8--feat-0003-alignment--shared-helper), [R9 Platform versions](#r9--platform-version-subtitles), [R10 Visual spacing](#r10--visual-spacing--icons), [R11 Analytics & errors](#r11--analytics--copy-failure), [R12 Launch order](#r12--launch-order--homepage-stack).

---

## Problem

| Today | Gap |
| ----- | --- |
| Download path only in navbar (`GetTroottButton` — feat-0003) | No dedicated **choose your platform** block on the homepage |
| Bottom **`CTASection`** opens newsletter modal | Listeners who scroll to the footer still lack App Store / Play / web choices |
| **`SplitDemoSection`** pushes Studio only | Ministers covered; **mobile app install** story missing at page bottom |
| Warp-style **install confidence** (OS icon, version hint, copy link) | Not present on Troott marketing site |

**Goal:** Before the final homepage CTA, give every visitor an obvious **Get Troott today** grid — iOS, Android, and web — wired through the same **`app.troott.com/get-troott`** handler as the navbar.

---

## Design reference (Warp → Troott)

| Warp (reference screenshot) | Troott v1 |
| --------------------------- | --------- |
| Eyebrow: `ALL DOWNLOADS` | `ALL DOWNLOADS` or `// Downloads` |
| Headline: `Get Warp today` | `Get Troott today` |
| Subtext: Warp Preview link | Short line: listen on mobile or web; optional link to Studio for ministers |
| Column: **Mac** + `.dmg` + `brew install` | Column: **iPhone & iPad** + App Store CTA |
| Column: **Linux** + `.deb` / `.rpm` / arch rows | Column: **Android** + Google Play CTA |
| Column: **Windows** + `.exe` + `winget` | Column: **Web app** + browser listen CTA |
| Cream primary buttons | Same visual weight — off-white tiles on black |
| Dark command pill + copy icon | Dark **copy link** pill with `get-troott?package=…` |
| x64 / ARM64 sub-buttons | **Out of v1** — mobile stores handle architecture |

Reference image: `./assets/warp-all-downloads.png`

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Insert **`DownloadsSection`** on homepage **after `Faqs`**, **before `CTASection`**. |
| **Why** | Matches Warp funnel: product story → FAQ → explicit downloads → final CTA. |
| **Section `id`** | `downloads` ([R6](#r6--anchor--seo)). |
| **Not in v1** | Standalone `/download` route on `troott.com` (get-troott lives on app host per feat-0003). |

### D2 — Platform columns (v1)

Three columns, fixed order:

| Column `id` | Header | Primary CTA label | `package` param |
| ----------- | ------ | ----------------- | --------------- |
| `ios` | iPhone & iPad | App Store | `ios` |
| `android` | Android | Google Play | `android` |
| `web` | Web app | Open in browser | `web` |

Each column includes:

- **OS icon** (Remix) centered above title
- **One** large primary download tile (cream/off-white)
- **One** copy-link row (dark pill) with full `get-troott` URL for that platform
- **Optional** one-line subtitle under primary tile (e.g. “iOS 16+”, “Android 8+”, “Chrome, Safari, Firefox”)

**Not in v1 columns:** macOS `.dmg`, Linux packages, Windows `.exe`, TestFlight row, QR codes, architecture toggles.

### D3 — Primary download CTAs

| | Detail |
| --- | ------ |
| **Href** | `{siteConfig.baseLinks.getTroott}?package={ios|android|web}` — **never** direct Play/App Store URLs on marketing site ([feat-0003 D2](../feat-0003/PRODUCT.md#d2--canonical-get-troott-url)). |
| **Target** | `target="_blank"` `rel="noopener noreferrer"` (leaves www, hits app host redirect). |
| **Fallback** | If `NEXT_PUBLIC_GET_TROOTT_ENABLED` is false ([feat-0003 D9](../feat-0003/PRODUCT.md#d9--launch-order)), primary tile opens **`NewsletterModal`** (listener) via shared fallback — same as navbar. |
| **Component** | Large tile is **`DownloadPlatformTile`** (feat-0005); may wrap or mirror `GetTroottButton` href logic — not required to reuse button shell if visual differs (Warp uses larger tiles than navbar). |

### D4 — Secondary rows & copy link

| | Detail |
| --- | ------ |
| **Copy pill** | Dark rounded row: display shortened URL or full URL; **copy icon** on right; toast “Link copied” on success ([sonner](https://sonner.emilkowal.ski/) already in website deps). |
| **Clipboard text** | Full canonical URL e.g. `https://app.troott.com/get-troott?package=ios`. |
| **Warp parity** | Replaces `brew install` / `winget install` — Troott has no CLI installer in v1. |
| **Extra rows** | **None** in v1 (no `.deb` list, no x64/ARM64 toggles). |

### D5 — Visual fidelity vs Warp reference

| Element | Warp | Troott v1 |
| ------- | ---- | ----------- |
| Background | `#000000` | `bg-background` / feat-0001 shell |
| Section padding | Generous | `py-20 sm:py-28`; `max-w-7xl` container |
| Eyebrow | Small caps gray | `font-mono text-[13px] text-zinc-500` |
| Headline | Large white | Match feat-0004 section H2 scale |
| Primary tile | Cream `#FDFCF0`, rounded-xl | `bg-[#FDFCF0] text-black` rounded-2xl, bold title + muted subtitle |
| Copy pill | `#1A1A1A`, mono `$ command` | `bg-zinc-900 border border-white/10`, sans URL text |
| Column grid | 3 equal cols desktop | `grid md:grid-cols-3 gap-8 lg:gap-12` |
| Icons | OS logos white | Remix: `RiAppleFill`, `RiGooglePlayFill`, `RiGlobalLine` |

---

## Recommendations (binding unless overridden)

### R1 — Copy

| Field | Recommended text |
| ----- | ---------------- |
| `label` | `ALL DOWNLOADS` |
| `heading` | `Get Troott today` |
| `description` | `Listen on iPhone, Android, or in your browser. Ministers can publish from Troott Studio.` |
| `studioLink` | `{ label: 'Open Troott Studio', href: siteConfig.baseLinks.studio }` — see [R7](#r7--closed-copy--ui-decisions) for placement |

**Per-column primary tile (title + subtitle):**

| Column | Primary title | Subtitle |
| ------ | ------------- | -------- |
| `ios` | App Store | iOS 16 or later |
| `android` | Google Play | Android 8 or later |
| `web` | Open in browser | Any modern browser |

### R2 — Warp → Troott mapping

Do **not** port Mac/Linux/Windows columns — Troott v1 is **mobile + web listener**. Desktop visitors use **Web app** column ([feat-0003](../feat-0003/PRODUCT.md) maps `dmg` / `exe` to web at handler level; no dedicated desktop column until native desktop ships).

### R3 — CTAs & get-troott

| | Recommendation |
| --- | -------------- |
| **URL builder** | Reuse `getTroottDownloadUrl(platform)` from feat-0003 TECH — do not duplicate string concat. |
| **Feature flag** | Respect `NEXT_PUBLIC_GET_TROOTT_ENABLED`; fallback to newsletter for all three columns when false. |
| **Minister path** | Do not add a fourth “Studio” column; use `studioLink` in header subtext only. |

### R4 — Layout & responsive

| Breakpoint | Behavior |
| ---------- | -------- |
| **`md+`** | Three columns side by side (Warp desktop). |
| **`< md`** | Stacked columns; each column: icon → title → primary tile → copy pill. |
| **Spacing** | Column headers centered; tiles full width of column. |

### R5 — Integration with feat-0003

| | Recommendation |
| --- | -------------- |
| **Shared lib** | `lib/build-get-troott-url.ts`, `lib/detect-platform.ts` from feat-0003 — import in downloads section. |
| **Highlight column** | Optional client enhancement: on mount, add subtle ring or “Recommended for you” on column matching `usePlatform()` — **P2**; not required v1. |
| **Navbar** | No change; downloads section complements navbar `GetTroottButton`. |
| **CTASection** | Keep existing newsletter **`CTASection`** after downloads; do not merge in v1. |

### R6 — Anchor & SEO

| | Recommendation |
| --- | -------------- |
| **`id`** | `id="downloads"` on `<section>`. |
| **H2** | One section heading “Get Troott today”. |
| **Column titles** | `h3` per platform (iPhone & iPad, Android, Web app). |

### R7 — Closed copy & UI decisions

Closes open questions from the first draft.

| Decision | Recommendation |
| -------- | -------------- |
| **Eyebrow** | `ALL DOWNLOADS` (Warp all-caps — not `// Downloads`) |
| **Studio link placement** | **Separate line** below description: `Open Troott Studio →` as text link — not embedded mid-sentence |
| **Web column header** | H3 stays **Web app**; primary tile title is **Open in browser** ([R1](#r1--copy) table) |
| **Copy pill display** | Show **full URL** on `sm+`; on `< sm` truncate middle with `…` (keep host + `package` visible) |
| **Store badges** | **Text cream tiles** (Warp style) — no official App Store / Google Play badge images in v1 |

**Description + studio (normative markup intent):**

```text
Listen on iPhone, Android, or in your browser.

Open Troott Studio →
```

### R8 — feat-0003 alignment & shared helper

feat-0003 [D5](../feat-0003/PRODUCT.md#d5--cta-scope-v1) scoped **`GetTroottButton`** to navbar v1. feat-0005 **extends** that scope to the homepage downloads grid — not a duplicate download system.

| | Recommendation |
| --- | -------------- |
| **Shared logic** | Extract **`lib/get-troott-download.ts`** (or extend feat-0003 `build-get-troott-url.ts`) with `getTroottDownloadUrl(package)` + `isGetTroottEnabled()` — used by navbar **and** downloads tiles |
| **Visual** | **`DownloadPlatformTile`** owns Warp cream layout; **imports href + flag only** — does not duplicate UA detection from `GetTroottButton` |
| **Analytics** | Reuse same event names as feat-0003 where applicable — see [R11](#r11--analytics--copy-failure) |
| **Desktop visitors** | No macOS/Windows column; optional one-line under grid (P2): “On Mac or PC, use **Web app** above.” — **omit in v1** |

### R9 — Platform version subtitles

Validate marketing copy against mobile app config:

| Subtitle | Source | Recommended text |
| -------- | ------ | ---------------- |
| iOS | [`apps/mobile/app.json`](../../../apps/mobile/app.json) `deploymentTarget: "16.0"` | **iOS 16 or later** |
| Android | Expo default min SDK unless overridden in build props | **Android 8 or later** (update if `minSdkVersion` is set explicitly later) |
| Web | — | **Any modern browser** |

Store subtitles in `_data/troott/downloads.ts`; add comment pointing to `app.json` for iOS.

### R10 — Visual spacing & icons

| Element | Recommendation |
| ------- | -------------- |
| **Section spacing** | `py-20 sm:py-28`; **`pb-24 sm:pb-32`** extra bottom padding before `CTASection` (CTA has large `mt-32` — avoid double gap by using `mt-0` on `CTASection` when downloads precedes it, or reduce CTA top margin in same PR) |
| **Header → grid** | `mb-12 sm:mb-16` (match feat-0004) |
| **Tile → copy pill** | `mt-4` |
| **Column icon** | `size-8 text-white`, centered, `mb-3` above H3 |
| **H3** | `text-lg font-medium text-white text-center mb-4` |
| **H2 full classes** | `text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]` |
| **Cream token** | Hardcode `#FDFCF0` in v1; promote to CSS variable in design-token pass (P2) |

### R11 — Analytics & copy failure

| | Recommendation |
| --- | -------------- |
| **Tile click** | `@vercel/analytics` `track('download_tile_click', { platform: 'ios' \| 'android' \| 'web' })` |
| **Copy success** | `track('download_link_copy', { platform })` |
| **Copy failure** | `toast.error('Could not copy link')`; no silent fail |
| **Newsletter fallback** | `track('listenerSignup', { source: 'downloads_section' })` when tile opens modal |
| **Web tile target** | `target="_blank"` for all three — consistent with get-troott leaving www |

### R12 — Launch order & homepage stack

**Implement after:**

1. [feat-0003](../feat-0003/PRODUCT.md) — `siteConfig.baseLinks.getTroott`, URL builder, feature flag  
2. [web feat-0035](../../../web/feature/feat-0035/PRODUCT.md) — live redirects (or accept newsletter fallback until live)

**Homepage order (with feat-0004):**

```text
HeroSection
WhyTroottSection          # feat-0004
PreText → BentoDemo → TextSection → Mission → SplitDemoSection
Faqs
DownloadsSection          # feat-0005
CTASection
```

**Optional P2:** Footer or Resources link to `/#downloads` — not required v1.

---

## User stories

1. As a **visitor on iPhone**, I scroll to downloads and tap **App Store** without hunting the navbar.
2. As a **visitor on Android**, I get Google Play via the same canonical redirect as marketing campaigns.
3. As a **desktop user**, I use **Web app** to listen without a misleading “Download for Mac” column.
4. As a **campaign owner**, I copy `get-troott?package=android` from the copy pill for emails or slides.

---

## Acceptance criteria

### Visual / UX

- [ ] Section matches Warp **structure**: eyebrow + headline + 3-column grid on `md+`.
- [ ] Each column: icon, title, cream primary tile, dark copy pill with working copy action.
- [ ] Stacked layout usable at 375px; no horizontal overflow.
- [ ] Dark-only ([feat-0001](../feat-0001/PRODUCT.md)).

### Links / behavior

- [ ] All primary tiles href to `get-troott?package=…` per [D3](#d3--primary-download-ctas).
- [ ] Copy pills copy full canonical URL; toast on success.
- [ ] When get-troott disabled, tiles fall back to newsletter ([D3](#d3--primary-download-ctas)).
- [ ] Copy matches [R1](#r1--copy) + [R7](#r7--closed-copy--ui-decisions); version subtitles per [R9](#r9--platform-version-subtitles).

### Integration

- [ ] Homepage order: … → `Faqs` → **`DownloadsSection`** → `CTASection`.
- [ ] Studio link on separate line below description ([R7](#r7--closed-copy--ui-decisions)).
- [ ] Shared get-troott helper from feat-0003 ([R8](#r8--feat-0003-alignment--shared-helper)); no duplicated URL strings.
- [ ] Analytics events on tile click + copy ([R11](#r11--analytics--copy-failure)).
- [ ] Copy failure shows error toast ([R11](#r11--analytics--copy-failure)).

### Quality

- [ ] `pnpm --filter @troott/website build` passes.
- [ ] Copy buttons keyboard-accessible; focus visible.

---

## Non-goals (v1)

- macOS / Linux / Windows installer columns or `brew` / `winget` blocks.
- x64 / ARM64 architecture toggles.
- QR codes, TestFlight, or beta track rows.
- Replacing **`CTASection`** or **`SplitDemoSection`**.
- Standalone `troott.com/download` page.
- Direct Play Store / App Store hrefs (bypass get-troott).

---

## Dependencies

| Spec | Relationship |
| ---- | -------------- |
| feat-0001 | Dark tokens |
| feat-0003 | **Extends** navbar download scope — shared URL helper + feature flag ([R8](#r8--feat-0003-alignment--shared-helper)) |
| web feat-0035 | Server redirect handler (required for live store redirects) |
| feat-0004 | Typography / container parity (optional visual alignment) |

---

## Open questions (only if recommendations rejected)

1. **CTASection top margin** — reduce `mt-32` when downloads sits above ([R10](#r10--visual-spacing--icons)) vs keep double spacing.
2. **Platform highlight** — auto-emphasize visitor OS column (P2).
3. **Footer link** to `/#downloads` (P2).

---

## References

- Warp: [warp.dev](https://www.warp.dev/) — bottom “All Downloads” section
- [`CTASection`](../../../apps/website/components/containers/CallToAction.tsx), [`page.tsx`](../../../apps/website/app/page.tsx)
- [feat-0003 PRODUCT](../feat-0003/PRODUCT.md), [web feat-0035](../../../web/feature/feat-0035/PRODUCT.md)
