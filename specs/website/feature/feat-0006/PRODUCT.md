# feat-0006: Homepage — logo cloud (infinite slider)

## Summary

Replace the placeholder **`LogoCloud`** (fictional SVG marks) with a **Warp-inspired social-proof strip**: left rail copy + **horizontally scrolling logo marquee** on desktop, static wrap grid on mobile. All logo assets come from **`apps/website/public/blocks/`**.

**Design reference (layout inspiration):** Warp “Proud partner of industry leaders” — left headline column + right visual rail (see user screenshot in session assets). **v1 implements the marquee rail only**, not the featured partner card grid.

**Implementation reference:** Infinite-slider `LogoCloud` pattern with `InfiniteSlider`, `ProgressiveBlur`, and `eslint-disable @next/next/no-img-element` for `/blocks/*` assets.

**App:** `apps/website` (`troott.com`). **Dark-only** per [feat-0001](../feat-0001/PRODUCT.md).

**Normative decisions:** [Placement](#d1--section-placement), [Logo sources](#d2--logo-sources-blocks), [Layout](#d3--layout-desktop--mobile), [Copy](#d4--copy), [Featured cards](#d5--featured-partner-cards-out-of-v1).

**Recommendations:** [R1 Asset treatment](#r1--asset-treatment-dark-theme), [R2 Motion](#r2--motion--accessibility), [R3 Homepage stack](#r3--homepage-stack), [R4 Legacy cleanup](#r4--legacy-cleanup).

---

## Problem

| Today | Gap |
| ----- | --- |
| `components/ui/LogoCloud.tsx` uses placeholder `Logos.*` SVG components (Biosynthesis, Sisyphus, etc.) | Not Troott-specific; not wired on homepage |
| Real brand/toolkit assets exist under `public/blocks/` | Unused on marketing site |
| No social-proof strip after hero | Warp-style landing pages establish trust early in the scroll |
| No infinite marquee utility | Need reusable `InfiniteSlider` + edge fade |

**Goal:** A lightweight, on-brand logo strip that surfaces **`/blocks`** assets and matches the dark marketing shell.

---

## Design reference (Warp → Troott)

| Warp reference (screenshot) | Troott v1 |
| --------------------------- | --------- |
| Left: “Proud partner of industry leaders” + subtext | Left rail: short Troott line (see [D4](#d4--copy)) |
| Right: featured partner **cards** with tags | **Out of v1** — marquee only ([D5](#d5--featured-partner-cards-out-of-v1)) |
| Bottom row: muted logo strip (GitHub, Asana, …) | **Infinite slider** of `/blocks` logos (desktop) |
| Full-width section on dark background | `bg-background`, feat-0001 tokens |

---

## Design decisions

### D1 — Section placement

| | Detail |
| --- | ------ |
| **Decision** | Insert **`LogoCloudSection`** on homepage **immediately after `HeroSection`**, **before `WhyTroottSection`**. |
| **Why** | Social proof directly under hero — matches Warp funnel; does not interrupt product story tabs. |
| **Section `id`** | `partners` (anchor-friendly; copy may say “partners” or “built with”) |
| **Not in v1** | Duplicate strip in footer; standalone `/partners` page |

### D2 — Logo sources (`/blocks`)

| | Detail |
| --- | ------ |
| **Decision** | **v1 logo list** — toolkit + platform marks from `public/blocks/` (paths relative to site root `/blocks/…`): |

| File | Alt text |
| ---- | -------- |
| `typescript.svg` | TypeScript |
| `go.png` | Go |
| `rust.png` | Rust |
| `node-js.svg` | Node.js |
| `react.svg` | React |
| `tailwind-css.svg` | Tailwind CSS |
| `canva.svg` | Canva |
| `figma.svg` | Figma |
| `notion.svg` | Notion |
| `mongodb.svg` | MongoDB |
| `express-js.svg` | Express |

| | Detail |
| --- | ------ |
| **Optional second group (follow-up)** | Ministry/partner marks already in `/blocks`: `damola-dark.svg`, `nn.png`, `dml.png`, `pacepard-pro.png` — use in **feat-0006b** or swap into v1 list if product prefers partner logos over toolkit |
| **Excluded v1** | `damola.png`, `damola-light.svg`, `damola.svg`, `og.png` — redundant or wrong theme variant |
| **Rejected** | New placeholder SVG logos in `Logos.tsx` |
| **Rejected** | Hotlinking external CDN logos |

### D3 — Layout (desktop + mobile)

| Viewport | Behavior |
| -------- | -------- |
| **Mobile (`< md`)** | Left copy stack; logos in **flex-wrap** grid (`gap-x-6 gap-y-8`), centered — no animation |
| **Desktop (`md+`)** | Two-column row: **narrow left rail** (`md:max-w-44`, right border) + **marquee** (`InfiniteSlider`, duplicated children, hover slows speed) |
| **Edge fade** | `ProgressiveBlur` left/right + `from-background` gradient masks on marquee — logos dissolve into page background |
| **Logo size** | `h-10 w-fit` (40px tall), consistent across items |

### D4 — Copy

| | Detail |
| --- | ------ |
| **Decision** | Left-rail text (v1): **“Built with the tools we trust, from idea to production.”** |
| **Why** | Troott brand voice; avoids unverifiable “800,000 developers” Warp copy |
| **Rejected** | “Toolkit I build with…” (personal portfolio tone) |
| **Rejected** | “Proud partner of industry leaders” without real featured partners in v1 |

### D5 — Featured partner cards (out of v1)

| | Detail |
| --- | ------ |
| **Decision** | Warp-style **tagged cards** (Livestream, Case Study, Launch Partner, gradient backgrounds, large wordmarks) are **not in v1**. |
| **Follow-up** | **feat-0006b** — optional grid using `damola-dark.svg`, `nn.png`, `dml.png`, `pacepard-pro.png` with Troott-specific tags |
| **Why** | User-provided implementation is marquee-first; cards need content, links, and art direction |

---

## User stories

1. **As a homepage visitor**, I see recognizable tech logos shortly after the hero and understand Troott is a modern product.
2. **As a mobile visitor**, I get a static, readable logo grid without distracting motion.
3. **As a desktop visitor**, I see a smooth infinite scroll with soft edge fades.
4. **As a developer**, I add or reorder logos by editing one data file pointing at `/blocks/*`.

---

## Success criteria

- [ ] `LogoCloudSection` renders on homepage after hero with id `partners`
- [ ] All **11** v1 logos load from `/blocks/` (no 404 in network tab)
- [ ] Desktop: `InfiniteSlider` runs; hover changes speed when `speedOnHover` set
- [ ] Mobile: no slider animation; wrap grid only
- [ ] Edge fades visible on desktop (`ProgressiveBlur` + gradient masks)
- [ ] Dark theme: logos readable ([R1](#r1--asset-treatment-dark-theme))
- [ ] `pnpm --filter @troott/website build` passes
- [ ] Placeholder `Logos.*` cloud removed or deprecated per [R4](#r4--legacy-cleanup)

---

## Additional recommendations

### R1 — Asset treatment (dark theme)

| Asset type | Treatment |
| ---------- | ----------- |
| SVG marks (react, figma, …) | `dark:invert` on `<img>` per reference implementation |
| PNG marks (go, rust) | `dark:invert` if logo is dark-on-transparent; verify visually |
| Partner PNGs (future) | Prefer `damola-dark.svg`; avoid invert on full-color PNGs |

### R2 — Motion & accessibility

| Item | Guidance |
| ---- | -------- |
| `prefers-reduced-motion` | Pause slider / show static row when `matchMedia('(prefers-reduced-motion: reduce)')` |
| Marquee | Decorative — section `aria-label="Technology partners and tools"`; each logo has meaningful `alt` |
| Keyboard | Slider not focusable; no trap |

### R3 — Homepage stack

```text
HeroSection
LogoCloudSection          ← NEW (feat-0006)
WhyTroottSection
…
```

### R4 — Legacy cleanup

| Item | Action |
| ---- | ------ |
| `components/ui/LogoCloud.tsx` | Replace implementation or delete after `LogoCloudSection` ships |
| `components/ui/Logos.tsx` | Keep if used elsewhere; remove imports from logo cloud only |

---

## Related

- Dark theme: [feat-0001](../feat-0001/PRODUCT.md)
- Homepage stack: [feat-0004](../feat-0004/PRODUCT.md), [feat-0005](../feat-0005/PRODUCT.md)
- Assets: `apps/website/public/blocks/`
- Motion: `motion` package (already in `apps/website/package.json`)
