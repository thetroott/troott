# Homepage content spec — `/`

**Route:** `apps/website/app/page.tsx`  
**Audience:** Mixed — listeners primary, ministers secondary (Studio CTA, one Studio feature block)  
**Voice:** Simple, everyday conversational English. Warm, spiritual, mobile-first. No jargon.  
**Source doc:** [`content.txt`](../../../../apps/website/_data/content.txt) — PRD, JTBD, waitlist/email copy, landing-page acceptance criteria.

---

## Summary

The homepage must answer in **30 seconds** (per `content.txt` §2.0 landing spec):

> “What is Troott, and why should I care?”

**Core promise** (from `content.txt`):

- Subscription-based **sermon streaming** — mobile-first, **ad-free**, no clutter.
- **Find, listen, and share** life-giving sermons anytime, anywhere.
- **Stay rooted in God’s Word** — organised library, not a mess of downloads.

**Do not** lead with minister piracy pain on `/` — that belongs on `/minister` ([feat-0016](../feat-0016/MINISTER_PAGE_CONTENT.md)).

---

## `content.txt` — what to pull from

| Theme | Where in `content.txt` | Use on homepage |
| ----- | ---------------------- | --------------- |
| Problem (ads, search, clutter) | §1.0–1.2, lines ~26–49 | Hero subtext, feature bullets |
| JTBD (#1–#5) | §3.0, lines ~80–93 | Feature highlights, Why Troott tabs |
| Product one-liner | §1.0 Solution, lines ~128–130 | Hero, section intros |
| Landing UVP (30s clarity) | §2.0, lines ~924–928 | Hero headline |
| Email / waitlist tone | lines ~977–998, 1009–1013 | Subtext, CTAs |
| Taglines | lines ~1117–1127 | Optional hero muted line, story section (future) |
| Feature list (play, share, library, search) | §2.0, lines ~136–203 | Feature highlight bullets, tab descriptions |

---

## Page structure (current `page.tsx`)

```text
/
├── 1. HeroSection                 — homeHeroContent
├── 2. WhyTroottSection            — whyTroottContent (scrollspy, #why-troott)
├── 3. SectionIntroSection        — whyTroottIntroContent
├── 4. FeatureHighlightSection    — featureHighlightContent (image left)
├── 5. FeatureHighlightSection    — featureHighlightStudioContent (image right)
├── 6. FeatureHighlightSection    — ⚠ duplicate today; should be unique third block
└── 7. WhyTroottTabsSection         — whyTroottContent (tabbed showcase)
```

**Target stack** (when commented sections ship): see [`specs/website/README.md`](../../README.md).

---

## Edit map — file → export → component

| # | Component | Data file | Export |
| - | --------- | --------- | ------ |
| 1 | `HeroSection` | `_data/troott/audience-landing.ts` | `homeHeroContent` |
| 2 | `WhyTroottSection` | `_data/troott/why-troott.ts` | `whyTroottContent` |
| 3 | `SectionIntroSection` | `_data/troott/section-intro.ts` | `whyTroottIntroContent` |
| 4 | `FeatureHighlightSection` | `_data/troott/feature-highlight.ts` | `featureHighlightContent` |
| 5 | `FeatureHighlightSection` | `_data/troott/feature-highlight.ts` | `featureHighlightStudioContent` |
| 6 | `FeatureHighlightSection` | `_data/troott/feature-highlight.ts` | `homeFeatureHighlightShareContent` *(proposed — see §6)* |
| 7 | `WhyTroottTabsSection` | `_data/troott/why-troott.ts` | `whyTroottContent` |

---

## Section 1 — Hero

**Component:** `HeroSection`  
**Data:** `homeHeroContent` in `@/_data/troott/audience-landing.ts`

### `content.txt` sources

- *“Troott is your new home for life-giving sermons, powerful messages, and spiritual nourishment, anytime, anywhere.”* (lines ~1009–1013)
- *“Stream sermons. Grow deeper.”* / *“Stay rooted in God’s Word”* (lines ~1021, 1117)
- *“Find, listen, and share audio sermons with your friends and family.”* (lines ~1067–1068)
- Landing UVP: clear headline in 30 seconds (lines ~924–928)

### Recommended copy

| Field | Copy |
| ----- | ---- |
| `headline` | `Stream sermons.` |
| `headlineMuted` | `Grow deeper.` |
| `subtext` | `Troott is your home for life-giving sermons — find ministers you trust, listen ad-free on mobile, and share messages with the people you love.` |
| `primaryCta.label` | `Start listening` |
| `primaryCta.kind` | `get-troott` |
| `secondaryCta.label` | `Upload sermons` |
| `secondaryCta.href` | `siteConfig.baseLinks.ministers` |
| `heroImage.src` | `/images/hero-image.png` |
| `heroImage.alt` | `Troott mobile app preview` |

### Current (as shipped)

| Field | Current value |
| ----- | ------------- |
| `headline` | `All the sermons and teachings` |
| `headlineMuted` | `you love, in one place.` |
| `subtext` | Find powerful messages… stay rooted in God’s Word. |

**Decision:** Either keep current pair or adopt recommended — both are valid; recommended aligns closer with waitlist/email language in `content.txt`.

---

## Section 2 — Why Troott (scrollspy)

**Component:** `WhyTroottSection`  
**Data:** `whyTroottContent` in `@/_data/troott/why-troott.ts`  
**Anchor:** `#why-troott`

### Section header

| Field | Recommended | Current |
| ----- | ----------- | ------- |
| `label` | `// Why Troott` | same |
| `heading` | `Stay rooted in God’s Word.` | `Listen with focus.` |
| `headingMuted` | `Wherever you are.` | `Share with confidence.` |

*Source:* lines ~996, 1117 — quiet time, on the move, at work.

### Tab 1 — Troott App (`listen`)

| Field | Recommended copy | `content.txt` tie-in |
| ----- | ---------------- | -------------------- |
| `navLabel` | `Troott App` | Mobile app PRD |
| `title` | `Your sermon library, organised` | JTBD #3 — organise collection |
| `description` | `Every message you love in one place. Stream ad-free, pick up where you left off, and stop juggling downloads and random links.` | Problem §1.2 — clutter, ads |
| `cta.label` | `Get the app` | `useGetTroott: true` |
| `image.alt` | `Troott app sermon library` | — |

### Tab 2 — Troott Studio (`studio`)

| Field | Recommended copy | `content.txt` tie-in |
| ----- | ---------------- | -------------------- |
| `navLabel` | `Troott Studio` | Admin / preacher upload |
| `title` | `Upload once. Reach everywhere.` | Upload + distribution |
| `description` | `Ministers publish from Studio. Troott handles processing, hosting, and delivery so listeners get a clean, official home for your messages.` | Feature spec — track upload |
| `cta.label` | `Open Studio` | external Studio link |

*Minister depth:* keep brief here; full copy on `/minister`.

### Tab 3 — Share & grow (`share`)

| Field | Recommended copy | `content.txt` tie-in |
| ----- | ---------------- | -------------------- |
| `title` | `Share teachings in one tap` | JTBD #4–#5, social features |
| `description` | `Send a sermon to family, your small group, or a friend — without leaving the app. Grow together through shared listening.` | Lines ~1067–1068, 39 |

### Tab 4 — For churches (`churches`)

| Field | Recommended copy |
| ----- | ---------------- |
| `title` | `One app for your whole church` |
| `description` | `Give every minister a library and every listener one place to follow, save, and return. Troott keeps your church’s messages organised and easy to share.` |

---

## Section 3 — Section intro (bridge)

**Component:** `SectionIntroSection`  
**Data:** `whyTroottIntroContent` in `@/_data/troott/section-intro.ts`

**Note:** Today this repeats the Why Troott H2. Prefer a **bridge** line before feature highlights.

### Recommended copy

| Field | Copy |
| ----- | ---- |
| `label` | `// Built for real life` |
| `heading` | `Find it. Listen.` |
| `headingMuted` | `Share it.` |

*Source:* JTBD mobile-first + share; avoids duplicate “Listen with focus.”

---

## Section 4 — Feature highlight (listener — personalised)

**Component:** `FeatureHighlightSection` (`imagePosition="left"`)  
**Data:** `featureHighlightContent` in `@/_data/troott/feature-highlight.ts`

### Recommended copy

| Field | Copy |
| ----- | ---- |
| `eyebrow` | `Personalised listening` |
| `heading` | `Built around you, from day one` |
| `description` | `Follow the ministers you trust, save sermons, and pick up where you left off — without ads getting in the way.` |
| `bullets[0]` | `Follow ministers and topics you care about` |
| `bullets[1]` | `Save messages to revisit anytime` |
| `bullets[2]` | `Resume playback across devices` |

*Source:* JTBD #1–#3; email bullets (lines ~982–985); enhanced discovery / personalised libraries in PRD.

---

## Section 5 — Feature highlight (Studio)

**Component:** `FeatureHighlightSection` (`imagePosition="right"`)  
**Data:** `featureHighlightStudioContent`

### Recommended copy

| Field | Copy |
| ----- | ---- |
| `eyebrow` | `Troott Studio` |
| `heading` | `Publish sermons without the busywork` |
| `description` | `Upload once from Studio. Troott handles processing, hosting, and delivery to listeners on mobile and web.` |
| `bullets[0]` | `Simple upload and metadata editing` |
| `bullets[1]` | `Organised sermon library for your ministry` |
| `bullets[2]` | `Reach listeners wherever they are` |

*Source:* Admin track upload, metadata, content curation (`content.txt` §Features).

---

## Section 6 — Feature highlight (listener — share) — **fix duplicate**

**Component:** `FeatureHighlightSection` (`imagePosition="left"`)  
**Data:** **Add** `homeFeatureHighlightShareContent` in `feature-highlight.ts` *(or reuse `listenerFeatureHighlightShareContent` from `/listener`)*

**Today:** `page.tsx` passes `featureHighlightContent` again — **replace**.

### Recommended copy

| Field | Copy |
| ----- | ---- |
| `id` | `home-feature-share` |
| `eyebrow` | `Share easily` |
| `heading` | `Pass it on in one tap` |
| `description` | `Send a sermon to family or your small group without leaving the app.` |
| `bullets[0]` | `Share a sermon link instantly` |
| `bullets[1]` | `Stay connected with people you love` |
| `bullets[2]` | `Grow together through shared listening` |

*Source:* JTBD #4–#5; listener value prop in `audience-landing.ts`; sermon interactions PRD.

### Implementation snippet

```tsx
// app/page.tsx
import {
  featureHighlightContent,
  featureHighlightStudioContent,
  homeFeatureHighlightShareContent, // new export
} from '@/_data/troott/feature-highlight';

<FeatureHighlightSection content={homeFeatureHighlightShareContent} imagePosition="left" />
```

---

## Section 7 — Why Troott tabs

**Component:** `WhyTroottTabsSection`  
**Data:** `whyTroottContent` (same object as §2)

Uses `defaultTabId: 'listen'`. Tab copy edits in §2 apply here. Mobile: stacked cards; desktop: segmented tabs.

**Product workflows** (`productWorkflowsContent`) is **not** on `/` today — only on `/minister` unless added later.

---

## CTAs and links

| CTA | Source | Config |
| --- | ------ | ------ |
| Get the app | `GetTroottButton` / `kind: 'get-troott'` | Opens platform chooser |
| Upload sermons | Hero secondary | `siteConfig.baseLinks.ministers` → `/minister` |
| Open Studio | Studio tab CTA | `siteConfig.baseLinks.studio` (external) |
| Start listening | Share tab | `siteConfig.baseLinks.listeners` → `/listener` |

---

## Voice checklist

- [ ] **Mobile-first** — “on your phone”, “on the move”, iOS/Android where relevant.
- [ ] **Ad-free** — name the pain once; don’t over-repeat.
- [ ] **Organised vs clutter** — contrast downloads/WhatsApp chaos with one library.
- [ ] **Share + community** — family, small group, loved ones (not generic “social network”).
- [ ] **Ministers secondary on `/`** — one Studio block + secondary hero CTA; no minister JTBD cards on homepage.
- [ ] **Plain English** — avoid “leverage”, “synergy”, startup jargon.

---

## Content edit checklist (before merge)

- [ ] Updated the correct `_data/troott/*.ts` export (not `content.txt` alone).
- [ ] Hero H1 + subtext read clearly on mobile (≤3 lines subtext).
- [ ] All three feature highlights are **distinct** stories.
- [ ] Studio CTA links to live Studio URL in `siteConfig`.
- [ ] Image `alt` strings describe the screen, not marketing slogans.
- [ ] `WhyTroottSection` and `SectionIntroSection` headlines are not unintentional duplicates.
- [ ] Spot-check `/` at `sm` and `lg` breakpoints.

---

## Related specs

- [feat-0015 — Audience landings](../feat-0015/PRODUCT.md) — `/listener`, `/minister`
- [feat-0016 — Minister page content](../feat-0016/MINISTER_PAGE_CONTENT.md)
- [feat-0004 — Why Troott tabs](../feat-0004/PRODUCT.md)
- [feat-0010 — Feature highlight](../feat-0010/PRODUCT.md)
- [feat-0011 — Product workflows](../feat-0011/PRODUCT.md)
