# feat-0001: Tech — Marketing website dark mode only

## Context

See [PRODUCT.md](./PRODUCT.md). Target app: **`apps/website`** (`@troott/website`, Next.js 15 App Router).

---

## Current theming stack

| Piece | Path | Issue |
| ----- | ---- | ----- |
| Theme provider | `app/layout.tsx` | `defaultTheme="system"` |
| Global CSS | `app/globals.css` | shadcn `--background` / `--foreground`; many `dark:` pairs |
| Theme toggle | `components/ThemeSwitch.tsx` | system / light / dark (footer import commented) |
| Themed assets | `components/containers/ThemedImage.tsx` | `lightSrc` / `darkSrc` + `useTheme()` |
| Toasts | `components/ui/sonner.tsx` | `theme={theme}` from `useTheme()` |
| Tailwind | `tailwind.config.ts` | `darkMode: 'class'` (keep — with forced `.dark`) |

---

## Target architecture

```text
<html lang="en" class="dark" style="color-scheme: dark">
  <body class="bg-neutral-950 text-gray-50 ...">
    <!-- Option A: no ThemeProvider -->
    <!-- Option B: ThemeProvider forcedTheme="dark" enableSystem={false} -->
    {children}
  </body>
</html>
```

Prefer **Option A** (remove `next-themes` from layout) if nothing needs runtime theme after cleanup. If keeping `next-themes` for SSR class sync, use Option B only — never Option C (system/light).

---

## Implementation checklist

| # | Task | File(s) |
| - | ---- | ------- |
| 1 | Add `className="dark"` + `color-scheme: dark` on `<html>` | `app/layout.tsx` |
| 2 | Set `forcedTheme="dark"` `enableSystem={false}` **or** remove `ThemeProvider` | `app/layout.tsx` |
| 3 | Remove `defaultTheme="system"` | `app/layout.tsx` |
| 4 | Delete `ThemeSwitch.tsx`; remove footer comment block | `ThemeSwitch.tsx`, `Footer.tsx` |
| 5 | Simplify `ThemedImage` → `src` only (alias `darkSrc` during migration) | `ThemedImage.tsx`, `MIssionImage.tsx` |
| 6 | Sonner: `theme="dark"` static | `components/ui/sonner.tsx` |
| 7 | Navbar scrolled state: dark glass only (`bg-black/70`, not `bg-white/80`) | `Navbar.tsx` |
| 8 | Hero bottom fade: dark gradient only (remove `from-white`) | `Hero.tsx` |
| 9 | Newsletter modal: dark surfaces only | `NewsletterModal.tsx` |
| 10 | Button `light` variant: rename or map to dark secondary (no white fill) | `Button.tsx` |
| 11 | Sweep high-traffic components for bare `bg-white` / `text-gray-900` without `dark:` | `components/**`, `app/**` |
| 12 | Optional: `:root` CSS variables set to dark values so shadcn primitives default dark | `globals.css` |

---

## Layout change (normative)

```tsx
// app/layout.tsx — after feat-0001
<html lang="en" className="dark" suppressHydrationWarning style={{ colorScheme: 'dark' }}>
  <body className={`${matter.className} min-h-screen bg-neutral-950 text-gray-50 antialiased ...`}>
    {/* children without system ThemeProvider, OR: */}
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      ...
    </ThemeProvider>
  </body>
</html>
```

Remove `dark:bg-neutral-950` from body when `bg-neutral-950` is unconditional.

---

## ThemedImage migration

**Before:**

```tsx
<ThemedImage lightSrc="/images/hero-mockup.png" darkSrc="/images/hero-mockup.png" ... />
```

**After:**

```tsx
<Image src="/images/hero-mockup.png" ... />
// or <MarketingImage src="..." /> with no theme hook
```

Delete `useTheme` import from image wrapper.

---

## Tailwind class migration strategy

1. **Phase 1 (P0):** Force `.dark` on `html` — immediate fix for OS light mode (dark: branches activate).
2. **Phase 2 (P1):** Collapse pairs — e.g. `text-gray-900 dark:text-gray-50` → `text-gray-50`.
3. **Phase 3 (P2):** Move repeated colors to CSS variables in `globals.css` under `.dark` or `:root` dark defaults.

P0 alone satisfies B1/B4; P2 reduces maintenance debt per PRODUCT § No fallback.

---

## High-priority files (light surfaces today)

| File | Known light classes |
| ---- | ------------------- |
| `components/containers/Navbar.tsx` | `bg-white/80`, `border-gray-100` when scrolled |
| `components/containers/Hero.tsx` | `from-white via-white` gradient mask |
| `components/NewsletterModal.tsx` | `bg-white dark:bg-neutral-900` |
| `components/ui/Cta.tsx` | `bg-white` inner card |
| `components/ui/InstaxImage.tsx` | `bg-white` frame |
| `components/containers/MIssionImage.tsx` | `bg-white` inner ring |
| `app/not-found.tsx` | light text tokens without forced dark |

Run audit:

```bash
rg 'bg-white|from-white|to-gray-800 bg-clip-text(?!.*dark:)' apps/website --glob '*.{tsx,jsx,css}'
```

---

## Verification

### Manual QA

1. macOS / iOS **Appearance: Light** → open `https://troott.com` (or localhost:3000) — full page dark.
2. Toggle OS to Dark — same visuals.
3. Open newsletter / subscribe dialog — dark modal.
4. Scroll nav — no white sticky bar.
5. Hard refresh — no white flash > 1 frame.

### Automated gates

```bash
# Must return no matches after implementation
rg 'defaultTheme="system"|setTheme\(.light.\)|value="light"|enableSystem=\{true\}' apps/website

# ThemeSwitch removed
test ! -f apps/website/components/ThemeSwitch.tsx
```

### CI

No new workflow required; existing `pnpm build:website` / site deploy unchanged.

---

## Related code map

| Concern | Path |
| ------- | ---- |
| Root layout | `apps/website/app/layout.tsx` |
| Global styles | `apps/website/app/globals.css` |
| Tailwind config | `apps/website/tailwind.config.ts` |
| Footer | `apps/website/components/containers/Footer.tsx` |
| Site metadata | `apps/website/app/siteConfig.tsx` |
