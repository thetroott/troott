# Website specs (`apps/website`)

Product and technical specifications for the **Troott marketing site** — Next.js app at **`https://troott.com`** (`@troott/website`).

Distinct from the studio portal (`apps/web` → `app.troott.com`). See [`specs/web/README.md`](../web/README.md).

## Feature specs

| ID | Topic | PRODUCT | TECH |
| -- | ----- | ------- | ---- |
| feat-0001 | Dark mode only — no light theme | [PRODUCT](./feature/feat-0001/PRODUCT.md) | [TECH](./feature/feat-0001/TECH.md) |
| feat-0002 | Navbar — Pacepard-style dropdown nav | [PRODUCT](./feature/feat-0002/PRODUCT.md) | [TECH](./feature/feat-0002/TECH.md) |
| feat-0003 | Navbar — `GetTroottButton` (platform icons + get-troott) | [PRODUCT](./feature/feat-0003/PRODUCT.md) | [TECH](./feature/feat-0003/TECH.md) |
| feat-0004 | Homepage — “Why Troott” tabbed product showcase | [PRODUCT](./feature/feat-0004/PRODUCT.md) | [TECH](./feature/feat-0004/TECH.md) |
| feat-0005 | Homepage — “Get Troott today” downloads grid | [PRODUCT](./feature/feat-0005/PRODUCT.md) | [TECH](./feature/feat-0005/TECH.md) |
| feat-0006 | Homepage — logo cloud (infinite slider) | [PRODUCT](./feature/feat-0006/PRODUCT.md) | [TECH](./feature/feat-0006/TECH.md) |
| feat-0007 | Homepage — **new** FAQ two-column accordion (`#faqs`) | [PRODUCT](./feature/feat-0007/PRODUCT.md) | [TECH](./feature/feat-0007/TECH.md) |
| feat-0008 | Homepage — **new** Benefits 3×2 grid (`#benefits`) | [PRODUCT](./feature/feat-0008/PRODUCT.md) | [TECH](./feature/feat-0008/TECH.md) |
| feat-0009 | Homepage — **new** product surfaces / use cases (`#why-troott`) | [PRODUCT](./feature/feat-0009/PRODUCT.md) | [TECH](./feature/feat-0009/TECH.md) |
| feat-0010 | Homepage — **new** feature highlight + mobile mockup rise | [PRODUCT](./feature/feat-0010/PRODUCT.md) | [TECH](./feature/feat-0010/TECH.md) |
| feat-0011 | Homepage — **new** vertical tabs + single visual panel (Warp Terminal) | [PRODUCT](./feature/feat-0011/PRODUCT.md) | [TECH](./feature/feat-0011/TECH.md) |
| feat-0012 | Homepage — **new** centered story headline + audience tags | [PRODUCT](./feature/feat-0012/PRODUCT.md) | [TECH](./feature/feat-0012/TECH.md) |
| feat-0013 | Homepage — **new** app showcase (center phone + tile marquees) | [PRODUCT](./feature/feat-0013/PRODUCT.md) | [TECH](./feature/feat-0013/TECH.md) |
| feat-0014 | **Legal** — audience chooser + scrollspy document pages | [PRODUCT](./feature/feat-0014/PRODUCT.md) | [TECH](./feature/feat-0014/TECH.md) |
| feat-0015 | **Audience landings** — `/listener` and `/minister` homepages | [PRODUCT](./feature/feat-0015/PRODUCT.md) | [TECH](./feature/feat-0015/TECH.md) |

### New homepage sections (feat-0007 – feat-0013)

These specs define **additive sections** on the marketing homepage — not redesigns of `CoreFeaturesSection`, `Mission`, `TextSection`, or other existing blocks.

| Feat | Section | Anchor | Placement (after → before) |
| ---- | ------- | ------ | -------------------------- |
| [feat-0009](./feature/feat-0009/PRODUCT.md) | Product surfaces (Exact-style tabs) | `#why-troott` | `FeaturedPartnersSection` → `BenefitsSection` |
| [feat-0008](./feature/feat-0008/PRODUCT.md) | Benefits grid | `#benefits` | `WhyTroottSection` → `CoreFeaturesSection` |
| [feat-0010](./feature/feat-0010/PRODUCT.md) | Feature highlight + mockup rise | `#feature-highlight` | `BenefitsSection` → `CoreFeaturesSection` |
| [feat-0012](./feature/feat-0012/PRODUCT.md) | Centered story headline + audience tags | `#audience-story` | `BenefitsSection` → `FeatureHighlightSection` |
| [feat-0007](./feature/feat-0007/PRODUCT.md) | FAQ accordion | `#faqs` | `SplitDemoSection` → `DownloadsSection` |
| [feat-0011](./feature/feat-0011/PRODUCT.md) | Vertical tabs + visual panel | `#product-workflows` | TBD — after `WhyTroottTabsSection` (proposed) |
| [feat-0013](./feature/feat-0013/PRODUCT.md) | App showcase (phone + tile marquees) | `#app-showcase` | `FeatureHighlightSection` → `CoreFeaturesSection` |

[feat-0004](./feature/feat-0004/PRODUCT.md) (Warp scroll-spy Why Troott) and [feat-0011](./feature/feat-0011/PRODUCT.md) (Warp vertical tabs + single panel) are **separate design references** — not modified by feat-0009.

### Audience landing routes (feat-0015)

Standalone marketing pages — not part of the homepage stack.

| Route | Purpose |
| ----- | ------- |
| `/listener` | Listener landing — get the app, listening value props |
| `/minister` | Minister landing — Studio CTA, publishing value props |
| `/listeners`, `/ministers` | Redirect to singular routes |

Nav/footer `siteConfig.baseLinks.listeners` and `.ministers` point here (replaces `#listener` / `#minister`).

### Legal routes (feat-0014)

Not part of the homepage stack. Standalone routes under `/legal` — layout matches [Why Troott scrollspy](../../../apps/website/components/containers/why-troott/WhyTroottSection.tsx).

| Route | Purpose |
| ----- | ------- |
| `/legal` | Choose Minister vs Listener |
| `/legal/listener` | Listener legal hub |
| `/legal/listener/terms-of-use` | Listener Terms of Use |
| `/legal/listener/privacy-policy` | Listener Privacy Policy |
| `/legal/listener/cookies` | Listener Cookie Policy |
| `/legal/listener/gdpr` | Listener GDPR |
| `/legal/minister` | Minister legal hub |
| `/legal/minister/terms-of-use` | Minister Terms of Use (Studio) |
| `/legal/minister/privacy-policy` | Minister Privacy Policy (Studio) |
| `/legal/minister/cookies` | Minister Cookie Policy |
| `/legal/minister/gdpr` | Minister GDPR |
| `/privacy`, `/terms` | Redirect to listener docs (mobile compatibility) |

**Target homepage stack** (`apps/website/app/page.tsx`):

```text
HeroSection
FeaturedPartnersSection
WhyTroottSection          ← feat-0004
WhyTroottTabsSection      ← feat-0009
ProductWorkflowsSection   ← feat-0011
BenefitsSection           ← feat-0008
AudienceStorySection      ← feat-0012
FeatureHighlightSection   ← feat-0010
AppShowcaseSection        ← feat-0013
CoreFeaturesSection
TextSection
Mission
SplitDemoSection
FaqsSection               ← feat-0007
DownloadsSection
CTASection
```

## Related

- Platform CI/CD: [`specs/platform/feature/feat-0001/PRODUCT.md`](../platform/feature/feat-0001/PRODUCT.md) — `@troott/website` deploy to `troott.com`
- App host get-troott handler: [web feat-0035](../web/feature/feat-0035/PRODUCT.md)
- Site config: [`apps/website/app/siteConfig.tsx`](../../apps/website/app/siteConfig.tsx)
