# feat-0001: Marketing website — dark mode only (no light theme)

## Summary

The Troott **marketing website** (`apps/website`, `@troott/website`, `https://troott.com`) must render **exclusively in dark mode**. There is no user-facing light theme, no system-theme follow, and no theme toggle.

Today the app uses **`next-themes`** with `defaultTheme="system"` and Tailwind `dark:` variant pairs across components. On devices set to **light** appearance, users see white backgrounds, light gray text, and light-mode gradients — a different product than intended.

This spec requires **dark UI everywhere, always**, independent of OS `prefers-color-scheme`.

Related: [platform feat-0001 CI/CD](../../platform/feature/feat-0001/PRODUCT.md) (website deploy). Studio portal theming is **out of scope** ([`specs/web`](../web/README.md)).

---

## Problem

| Area | Today | User impact |
| ---- | ----- | ------------- |
| Root layout | `ThemeProvider` `defaultTheme="system"` | Light OS → light landing page |
| Components | Paired classes (`bg-white dark:bg-gray-950`, `text-gray-900 dark:text-gray-50`) | Light branch visible when `.dark` absent |
| Hero / CTA | Light gradients (`from-white`, `bg-white/80` nav) | White flash on scroll and hero |
| `ThemedImage` | Picks `lightSrc` when theme is light or unresolved | Wrong asset before hydration |
| `ThemeSwitch` | System / light / dark radio (commented in footer, still in repo) | Future re-enable would violate policy |
| Dialogs / modals | `NewsletterModal` uses `bg-white` base | Subscribe flow can appear light |
| Toasts | `sonner` follows `useTheme()` including `system` | Light toasts on light OS |

**Product rule:** Troott marketing is a **dark brand surface** (neutral-950 shell, light text, teal accents) — same on every device and route.

---

## Definition: dark-only UI (reference)

The **canonical dark marketing shell** is what users should see when `html` has the dark palette active:

| Region | Reference |
| ------ | --------- |
| Page background | `neutral-950` / `--background` dark tokens ([`layout.tsx`](../../../apps/website/app/layout.tsx)) |
| Body text | `gray-50`–`gray-400` on dark surfaces |
| Primary CTA | Teal accent (`teal-400` / `teal-600` on buttons) |
| Nav (scrolled) | Dark translucent bar (`dark:bg-black/70`), not white glass |
| Cards / modals | `neutral-900` / `gray-950`, not `bg-white` |
| Footer | Dark text hierarchy (`dark:text-gray-50` patterns become default) |

**Not acceptable:** any screen where the dominant background is white or light gray because the user’s OS prefers light.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-WM01 | Visitor on iPhone (light mode) | troott.com to load dark | Brand matches studio/marketing intent |
| UC-WM02 | Visitor on desktop (dark mode) | Same UI as mobile | Consistent experience |
| UC-WM03 | Engineer | One theme path in code | No `light` / `system` branches to maintain |
| UC-WM04 | Designer | No theme toggle in footer or nav | Users cannot switch to light |

---

## Required behavior

### B1 — Force dark at the document root

1. **`html` must always use dark styling** — via `class="dark"` on `<html>` and/or `ThemeProvider` with `forcedTheme="dark"` and `enableSystem={false}`.
2. Set **`color-scheme: dark`** on `html` so native controls (scrollbars, form controls) match.
3. **Remove** `defaultTheme="system"` and any code path that sets theme to `light` or `system`.

### B2 — No theme switcher

4. **Do not render** `ThemeSwitch` (or any light/dark/system control) in footer, nav, or settings.
5. **Delete** `ThemeSwitch` usage and exports once unused — do not leave commented toggle “for later”.

### B3 — Components use dark palette by default

6. All marketing routes (`/`, sections, `#faqs`, `not-found`, modals) use **dark-surface tokens** without relying on OS theme.
7. Replace paired `light + dark:` Tailwind classes with **single dark values** (or shadcn CSS variables scoped to dark `:root` / `.dark` only).
8. **`ThemedImage`:** single `src` prop (or always use dark asset); remove `lightSrc` / theme switch logic.
9. **Third-party UI:** Sonner / Radix dialogs must use **dark** theme explicitly (`theme="dark"`), not `useTheme()` system resolution.

### B4 — No light-mode flash (FOUC)

10. First paint must be dark — no white flash before hydration. Prefer `class="dark"` on `<html>` in server-rendered layout (not client-only `useEffect`).
11. `suppressHydrationWarning` on `<html>` remains acceptable for theme class hydration.

### B5 — Scope

12. Applies to **`apps/website` only** — not `apps/web`, not `apps/mobile`.
13. MDX content, newsletter modal, navbar, hero, mission, FAQ, CTA, 404 — all in scope.

---

## Acceptance criteria

1. With OS **light** appearance: entire homepage, footer, modals, and 404 are dark (manual QA + screenshot).
2. With OS **dark** appearance: unchanged dark UI (regression).
3. No visible theme toggle anywhere on the site.
4. View-source or DevTools: `<html class="dark">` (or equivalent forced dark) on all routes.
5. `prefers-color-scheme: light` media query does **not** change background to white.
6. Lighthouse / manual: no large white regions on hero, nav, or subscribe dialog.
7. Grep gate: no `defaultTheme="system"`, no `setTheme('light')`, no `value="light"` in `apps/website` ([§ No fallback](#no-fallback-no-legacy-hard-requirement)).
8. `ThemeSwitch` file removed or empty export deleted — not commented back into footer.

---

## Out of scope

- Rebuilding marketing copy or layout sections (visual refresh beyond dark-only).
- Studio portal (`apps/web`) theme.
- Mobile app theme.
- User preference persistence for theme (there is only one theme).
- Automatic light mode for accessibility “high contrast light” — dark-only is explicit product choice.

---

## No fallback, no legacy (hard requirement)

Implementation must **delete** light-theme paths — not hide them behind flags or keep `dark:` pairs “just in case.”

### Prohibited patterns

| Do not | Why |
| ------ | --- |
| `defaultTheme="system"` or `enableSystem` without `forcedTheme="dark"` | OS light mode leaks |
| Theme toggle (system / light / dark) | Product is dark-only |
| `ThemedImage` `lightSrc` + theme switch | Implies two themes |
| Leave `ThemeSwitch` commented in footer “for later” | Re-introduces light path |
| `useTheme()` branching with `light` case in new components | Single theme only |
| `@media (prefers-color-scheme: light)` overrides that set light backgrounds | Bypasses forced dark |
| Feature flag `NEXT_PUBLIC_ALLOW_LIGHT_THEME` | No dual-path rollout |

### Required cleanup

| Location | Action |
| -------- | ------ |
| `app/layout.tsx` | Force dark; drop system default |
| `components/ThemeSwitch.tsx` | **Remove** file if unused |
| `components/containers/ThemedImage.tsx` | Single-source image API |
| `components/ui/sonner.tsx` | Hard-code `theme="dark"` |
| Paired Tailwind classes | Collapse to dark values (incremental OK per route, all routes before close) |

### Correct failure mode

If a component still looks light: **fix its classes/tokens** — never re-enable system theme as workaround.

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Files, migration steps, QA |
| [`specs/website/README.md`](../../README.md) | Website spec index |
