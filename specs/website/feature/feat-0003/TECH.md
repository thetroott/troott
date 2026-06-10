# feat-0003: Tech — Smart platform download button (navbar)

## Context

See [PRODUCT.md](./PRODUCT.md). Target: **`apps/website`**, component consumed by `components/containers/Navbar.tsx` (`HeaderActions`).

**Closed decisions:** [D1 Detection](./PRODUCT.md#d1--detection-scope), [D2 get-troott URL](./PRODUCT.md#d2--canonical-get-troott-url), [D3 Destinations](./PRODUCT.md#d3--destinations-per-platform), [D4 Modal fallback](./PRODUCT.md#d4--newsletter-modal-vs-store-link), [D5 Scope](./PRODUCT.md#d5--cta-scope-v1), [D6 GetTroottButton](./PRODUCT.md#d6--reusable-gettroottbutton-with-platform-icons), [D7 Store URLs](./PRODUCT.md#d7--store-urls-binding), [D8 Handler](./PRODUCT.md#d8--get-troott-handler-delivery), [D9 Launch order](./PRODUCT.md#d9--launch-order), [D10 SSR label](./PRODUCT.md#d10--ssr-label), [D11 Navbar](./PRODUCT.md#d11--navbar-feat-0002-alignment).

**Cross-app:** Marketing button in **`apps/website`**; redirect handler at **`https://app.troott.com/get-troott`** in **`apps/web`** — full matrix in [web feat-0035 TECH](../../../web/feature/feat-0035/TECH.md).

---

## Objective

Implement a reusable **`GetTroottButton`** client component that:

1. Detects platform after mount (label + **required icon**).
2. Builds **`href`** → `{getTroott}?package={android|ios|dmg|exe|web}` per [D2](./PRODUCT.md#d2--canonical-get-troott-url).
3. Renders **label → platform icon → optional shortcut badge** (Warp-style anatomy — see [D6](./PRODUCT.md#d6--reusable-gettroottbutton-with-platform-icons)).
4. Is imported by `Navbar.tsx` first; reusable in Hero, footer, CTAs without duplication.

Paired deliverable: **`/get-troott`** on **`apps/web`** — [feat-0035 TECH](../../../web/feature/feat-0035/TECH.md).

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Language | TypeScript |
| Styling | Tailwind + existing shadcn `Button` |
| Icons | `@remixicon/react` (match feat-0002 navbar) |
| Analytics | `@vercel/analytics` `track()` |
| Detection | `navigator.userAgent` + iPad/macOS disambiguation |

---

## Commands

Run from repo root or `apps/website`:

```bash
# Dev
pnpm dev:website

# Typecheck / build
pnpm --filter @troott/website build

# Lint
pnpm --filter @troott/website lint
```

Manual QA: Chrome DevTools → device toolbar (Android / iPhone); desktop UA strings for Mac/Windows.

---

## Project structure

```text
apps/website/
├── app/siteConfig.tsx
├── _data/troott/download-platforms.ts   # label, Icon component, analytics id per platform
├── components/
│   ├── ui/
│   │   └── get-troott-button.tsx        # NEW — reusable GetTroottButton (export from index if needed)
│   └── containers/
│       └── Navbar.tsx                   # consumes GetTroottButton only
├── hooks/usePlatform.ts
└── lib/
    ├── detect-platform.ts
    └── build-get-troott-url.ts
```

**Do not** bury platform/icon logic inside `Navbar.tsx`. All detection, icons, and href building live in **`GetTroottButton`** + `_data` / `lib`.

**v1 minimum (website):** `GetTroottButton.tsx`, `detect-platform.ts`, `build-get-troott-url.ts`, `download-platforms.ts`, `usePlatform.ts`, `siteConfig.getTroott`, `Navbar.tsx` wiring.

**v1 minimum (web):** `/get-troott` redirect handler (required for end-to-end acceptance).

---

## Code style

- `'use client'` only on components/hooks that touch `navigator`.
- Pure detection in `lib/detect-platform.ts` — no React imports.
- URLs only from `siteConfig` / `_data` — never inline production store URLs in JSX.
- Use `cx()` from `@/lib/utils`; match feat-0002 button classes.

**Example — platform resolver (illustrative):**

```ts
// lib/detect-platform.ts
export type Platform = 'android' | 'ios' | 'macos' | 'windows' | 'unknown';

export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPod/i.test(ua)) return 'ios';
  if (/iPad/i.test(ua) || (maxTouchPoints > 1 && /Macintosh/i.test(ua))) return 'ios';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  return 'unknown';
}
```

**Example — href builder (normative):**

```ts
// lib/build-get-troott-url.ts
import { siteConfig } from '@/app/siteConfig';
import type { Platform } from './detect-platform';

const PACKAGE_PARAM: Record<Platform, string | null> = {
  android: 'android',
  ios: 'ios',
  macos: 'dmg',
  windows: 'exe',
  unknown: null,
};

export function getTroottDownloadUrl(platform: Platform): string {
  const base = siteConfig.baseLinks.getTroott; // https://app.troott.com/get-troott
  const pkg = PACKAGE_PARAM[platform];
  return pkg ? `${base}?package=${pkg}` : base;
}
```

**Example — platform CTA config with icons:**

```ts
// _data/troott/download-platforms.ts
import {
  RiAppleFill,
  RiGooglePlayFill,
  RiPlayCircleFill,
  RiWindowsFill,
} from '@remixicon/react';
import { getTroottDownloadUrl } from '@/lib/build-get-troott-url';
import type { Platform } from '@/lib/detect-platform';

export type DownloadCtaConfig = {
  label: string;
  href: string;
  Icon: typeof RiAppleFill;
  analytics: string;
  ariaLabel: string;
};

export function getDownloadCta(
  platform: Platform,
  labelMode: 'compact' | 'full' = 'compact',
): DownloadCtaConfig {
  // compact: "Download" + platform Icon; full: "Download for Android", etc.
  // Icon is REQUIRED in every branch — never return config without Icon
}
```

---

## siteConfig additions

Extend `baseLinks` in `apps/website/app/siteConfig.tsx`:

```ts
baseLinks: {
  // existing...
  getTroott: 'https://app.troott.com/get-troott',
  listenersWeb: 'https://app.troott.com', // reference only; redirects owned by get-troott
}
```

**Store URLs do not belong in `apps/website/siteConfig`.** Play Store / App Store targets are configured in the **`apps/web` get-troott handler** (env or config module).

---

## get-troott handler (`apps/web`)

**Authoritative spec:** [web feat-0035 TECH](../../../web/feature/feat-0035/TECH.md).

### Canonical store URLs (binding — app host env only)

```bash
TROOTT_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.troott.app
TROOTT_APP_STORE_URL=https://apps.apple.com/ng/app/troott/id1234567890
TROOTT_WEB_APP_URL=https://app.troott.com
TROOTT_DMG_URL=                    # empty v1 — package=dmg → web app
TROOTT_EXE_URL=                    # empty v1 — package=exe → web app
```

### Redirect matrix (summary)

| Input | Redirect to |
| ----- | ----------- |
| `?package=android` | Play Store URL |
| `?package=ios` | App Store URL |
| `?package=web` | Web app |
| `?package=dmg` | `TROOTT_DMG_URL` if set, else web app |
| `?package=exe` | `TROOTT_EXE_URL` if set, else web app |
| No param | UA inference (same rules as client) |

### v1 delivery ([D8](./PRODUCT.md#d8--get-troott-handler-delivery))

`apps/web/public/get-troott.html` + hosting path rule — not SPA router. Follow-up: nginx/Coolify **302** with identical matrix.

### Manual QA

```bash
curl -sI "https://app.troott.com/get-troott?package=android" | grep -i location
curl -sI "https://app.troott.com/get-troott?package=ios" | grep -i location
curl -sI "https://app.troott.com/get-troott?package=web" | grep -i location
curl -sI "https://app.troott.com/get-troott?package=dmg" | grep -i location
curl -sI "https://app.troott.com/get-troott?package=exe" | grep -i location
```

---

## GetTroottButton — reusable component API

**File:** `components/ui/get-troott-button.tsx`  
**Export:** `GetTroottButton`

### Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `labelMode` | `'compact' \| 'full'` | `'compact'` | Short **Download** vs long platform label |
| `variant` | `'primary' \| 'neutral'` | `'primary'` | feat-0002 filled CTA vs light Warp-style pill |
| `showShortcut` | `boolean` | `false` | Desktop kbd badge (**D**) after icon |
| `shortcutKey` | `string` | `'D'` | Character shown in kbd pill |
| `onFallback` | `() => void` | — | Newsletter modal when get-troott not live |
| `getTroottEnabled` | `boolean` | `false` | Feature flag until handler ships ([D9](./PRODUCT.md#d9--launch-order)); wire to `NEXT_PUBLIC_GET_TROOTT_ENABLED` |
| `className` | `string` | — | Passed to root `Button` |
| `size` | shadcn size | `'lg'` | Match navbar `h-10` |

### Internal structure (normative)

```tsx
<Button asChild className={cx('inline-flex items-center gap-2', className)}>
  <Link href={cta.href} aria-label={cta.ariaLabel} ...>
    <span>{cta.label}</span>
    <cta.Icon aria-hidden className="size-4 shrink-0" />
    {showShortcut ? (
      <kbd className="ml-1 hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
        {shortcutKey}
      </kbd>
    ) : null}
  </Link>
</Button>
```

Register optional **`D`** keyboard shortcut when `showShortcut` — `useEffect` + `keydown` listener; only when document focused and not in input.

### Render modes

| Condition | Render |
| --------- | ------ |
| `getTroottEnabled` | Link with label + **Icon** + optional kbd |
| Handler disabled | `<Button onClick={onFallback}>` — still show fallback label + `RiPlayCircleFill` |

All link paths use **`get-troott?package=…`**. Icons **required** in every state (including SSR fallback).

### Hydration / SSR

1. **SSR + first paint:** **Download** + `RiPlayCircleFill` (`size-4`), same button dimensions ([D10](./PRODUCT.md#d10--ssr-label)).
2. **After mount:** swap to platform label + platform icon; prefer compact **Download** label to minimize CLS.
3. `aria-label` uses full platform string even when label is compact.

### Icons (Remix) — required

| Platform | Icon |
| -------- | ---- |
| Android | `RiGooglePlayFill` |
| iOS | `RiAppleFill` |
| macOS | `RiAppleFill` |
| Windows | `RiWindowsFill` |
| Unknown / SSR | `RiPlayCircleFill` |

Verify exports in installed `@remixicon/react` ([R1](./PRODUCT.md#additional-recommendations-implementer-checklist)); substitute closest match if renamed.

### Navbar integration

```tsx
// HeaderActions
<GetTroottButton
  showShortcut
  onFallback={onOpenListener}
  className="h-10 rounded-md px-4 ..."
/>
```

Mobile sheet: `<GetTroottButton onFallback={onOpenListener} />` — **no** `showShortcut`.

Optional “Other platforms”: `<Link href={siteConfig.baseLinks.getTroott}>Other platforms</Link>`.

---

## Removed from v1 scope

~~`troott.com/download`~~ — replaced by **`app.troott.com/get-troott`**. Do not add a duplicate redirect on the marketing site.

---

## Testing strategy

| Level | What | How |
| ----- | ---- | --- |
| Unit | `detectPlatform()` | Vitest or Jest in `apps/website` if present; else Node script with fixture UA strings |
| Manual | Navbar CTA | DevTools device mode + real devices |
| Manual | Fallback | Clear `appStore` in config → modal still opens |
| Build | No SSR crash | `pnpm --filter @troott/website build` |
| A11y | Screen reader | VoiceOver reads full `aria-label` |

**Fixture UA strings (minimum):**

```ts
const fixtures = [
  { ua: 'Mozilla/5.0 (Linux; Android 14)', expect: 'android' },
  { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', expect: 'ios' },
  { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', expect: 'macos' },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expect: 'windows' },
];
```

---

## Boundaries

**Always:**

- Every render path includes a **platform icon** (`size-4`) after the label.
- Button `href` uses `siteConfig.baseLinks.getTroott` + `package` query.
- Keep Login + Upload CTAs per feat-0002 ([D11](./PRODUCT.md#d11--navbar-feat-0002-alignment)).
- Fire analytics on click with platform-specific event name.
- Use `target="_blank"` + `rel="noopener noreferrer"` for get-troott links.

**Ask first:**

- Adding get-troott to sitemap / robots on app host.
- Changing Hero / CTA sections to use the same component (scope expansion).
- Adding new npm dependencies for UA parsing (prefer zero-deps parser in v1).
- Direct Play/App Store links anywhere on marketing site (bypasses get-troott).

**Never:**

- Hardcode platform icons or detection in `Navbar.tsx` — use **`GetTroottButton`** only.
- Ship text-only download button without icon after hydration.
- Rely on UA detection for security or feature gating.
- Block desktop users from web app when mobile app unavailable.

---

## Implementation tasks

- [ ] **Task 1:** Add `baseLinks.getTroott` to `siteConfig.tsx`
  - Acceptance: `https://app.troott.com/get-troott`
  - Verify: TypeScript build

- [ ] **Task 2:** Implement `lib/detect-platform.ts` + `lib/build-get-troott-url.ts`
  - Acceptance: URLs match PRODUCT D2 examples
  - Verify: unit fixtures / manual table

- [ ] **Task 3:** Implement `hooks/usePlatform.ts`
  - Acceptance: returns `unknown` on server; updates after mount
  - Verify: no hydration warning in dev console

- [ ] **Task 4:** Implement `GetTroottButton.tsx` + `download-platforms.ts`
  - Acceptance: label + **required icon** + href per platform; kbd badge when `showShortcut`; modal fallback
  - Verify: DevTools — Android shows Play icon, iOS/mac show Apple, Windows shows Windows icon

- [ ] **Task 5:** Wire into `Navbar.tsx` (`HeaderActions` + mobile sheet)
  - Acceptance: replaces Start listening; Login unchanged
  - Verify: mobile + desktop visual check

- [ ] **Task 6 (paired — `apps/web`):** Implement `/get-troott` per [feat-0035 TECH](../../../web/feature/feat-0035/TECH.md)
  - Acceptance: `?package=android|ios|web|dmg|exe` → correct redirect targets
  - Verify: `curl -sI` against staging/production app host **before** setting `NEXT_PUBLIC_GET_TROOTT_ENABLED=true`
  - Files: `apps/web/public/get-troott.html` + hosting rule

- [ ] **Task 7:** Restore feat-0002 navbar labels (Login, Upload sermons) in same PR as Task 5
  - Acceptance: [D11](./PRODUCT.md#d11--navbar-feat-0002-alignment)
  - Verify: visual compare to feat-0002 spec

---

## Analytics

| Event | When |
| ----- | ---- |
| `downloadCtaAndroid` | Click → `get-troott?package=android` |
| `downloadCtaIos` | Click → `get-troott?package=ios` |
| `downloadCtaWeb` | Click → `get-troott?package=web` |
| `downloadCtaDmg` | Click → `get-troott?package=dmg` |
| `downloadCtaExe` | Click → `get-troott?package=exe` |
| `downloadCtaFallback` | Modal when get-troott not live |
| `listenerSignup` | Retain when modal opens (existing) |

---

## Current state (baseline)

| Piece | Path | Notes |
| ----- | ---- | ----- |
| Navbar CTA | `Navbar.tsx` → `HeaderActions` | `Start listening` → `onOpenListener` → newsletter |
| Hero CTA | `HeroSection.tsx` | `#listener` anchor — out of v1 scope |
| siteConfig | `siteConfig.tsx` | Add `getTroott`; no store URLs on marketing site |
| get-troott handler | **`apps/web`** | **Not implemented** — [feat-0035](../../../web/feature/feat-0035/TECH.md) |
| Mobile package | `apps/mobile/app.json` | `com.troott.app` |

---

## Success verification checklist

- [ ] PRODUCT success criteria met
- [ ] `pnpm --filter @troott/website build` passes
- [ ] Android / iOS / desktop manual QA documented in PR
- [ ] Store URLs configured on app host ([D7](./PRODUCT.md#d7--store-urls-binding))
- [ ] `dmg` / `exe` redirect to web until installer env vars set
