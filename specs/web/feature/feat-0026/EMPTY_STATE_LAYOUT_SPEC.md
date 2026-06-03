# feat-0026: Web **empty state** layout — centered in page, region, or component

## Summary

An **empty state** is UI shown when there is nothing to list, show, or select: zero rows, no search results, first-time library, or “choose an item” prompts. **Copy and CTAs vary by feature; layout does not.** Every empty state must be **centered** within the **placement boundary** defined below.

**Normative rule:**

> Empty state content (title, body, optional illustration, primary/secondary actions) is **horizontally and vertically centered** relative to its placement boundary, with **text-align: center** on the text block.

---

## Placement tiers

| Tier | Boundary | When to use | Must fill |
| --- | --- | --- | --- |
| **Page** | Full main column below global layout chrome (sidebar + top bar) | Whole route has no content (auth/profile gate, full-page error) | `flex-1` of main scroll area |
| **Region** | Feature **content area** under local chrome (header, tabs, toolbar) | My Sermons table zone, Bin list zone, Analytics tab body | `MY_SERMONS_PAGE.contentStack` or equivalent `flex-1 min-h-0` |
| **Panel** | Card, table widget, dialog section, chart area | Analytics breakdown helper, sermon picker empty, modal body | Parent panel; `min-h` per table below |

```text
┌─ Page (viewport main) ─────────────────────────────┐
│  Header / tabs / toolbar  (chrome — not empty)   │
│  ┌─ Region (contentStack) ─────────────────────┐ │
│  │         ┌─ Panel (optional) ─────────┐    │ │
│  │         │   [ centered empty ]       │    │ │
│  │         └────────────────────────────┘    │ │
│  │  [ pagination / footer ]                  │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Pagination / footers:** Region-tier empties center in the area **above** a pinned pagination bar (`contentWithFooter` + `contentScroll` pattern). They must **not** include the pagination strip in the centered block.

---

## Required layout (normative)

### Shared flex pattern

All tiers use the same inner stack:

```text
[ outer: flex + items-center + justify-center + text-center (+ min-height) ]
  └─ [ inner: flex flex-col items-center gap-* max-w-* ]
       ├─ title (optional)
       ├─ description
       └─ actions (optional)
```

### Class tokens (implement in `studio-empty-state-ui.ts`)

| Token | Classes (Tailwind) | Use |
| --- | --- | --- |
| `STUDIO_EMPTY_STATE.inner` | `flex flex-col items-center justify-center gap-4 text-center` | Wrap title + body + CTAs |
| `STUDIO_EMPTY_STATE.title` | `font-matter-medium text-lg leading-6 text-[#eaeaea]` | Heading |
| `STUDIO_EMPTY_STATE.description` | `max-w-sm font-matter text-sm leading-5 text-[#9d9d9d]` | Body (adjust `max-w-md` for longer copy) |
| `STUDIO_EMPTY_STATE.page` | `flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8` | Page tier outer |
| `STUDIO_EMPTY_STATE.region` | `flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8` | Region tier outer |
| `STUDIO_EMPTY_STATE.panel` | `flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center` | Panel tier outer |
| `STUDIO_EMPTY_STATE.panelTall` | `flex min-h-[280px] …` | Tall cards (e.g. analytics placeholder) |

Reference implementation: `AnalyticsSermonEmpty.tsx` (panel tier — **compliant**).

### Minimum heights

| Tier | Minimum vertical space |
| --- | --- |
| **Page** | `flex-1` of parent; no fixed `py-*` only |
| **Region** | `flex-1` inside `contentStack`; avoid `py-16` without `flex-1` |
| **Panel** | `min-h-[200px]` default; `min-h-[280px]` for primary tab panels |

### Forbidden patterns

| Anti-pattern | Why |
| --- | --- |
| Only `py-16` / `py-24` on a div **without** `flex-1` inside a tall `contentStack` | Empty sits at **top** of a large blank region |
| Empty copy left-aligned in a full-width row under table headers | Breaks centering contract for **region** tier |
| Empty only in table footer row while header + empty tbody leave viewport unused | Use region overlay or dedicated empty row with `min-h` |
| Decorative empty that is not centered when used as modal backdrop | Backdrop may use Figma table chrome; promotional empty still centers in **region** when interactive |

**Loading and error states:** Same centering rules apply when the whole region is replaced by loading spinner or error + Retry (see My Sermons / Bin loading shells).

---

## Content guidelines (non-layout)

| Element | Guidance |
| --- | --- |
| **Title** | Short, sentence case — e.g. “Bin is empty”, “Nothing here” |
| **Description** | One or two lines; explain why empty or what to do next |
| **Primary CTA** | Optional; studio primary teal for constructive actions (`STUDIO_HEADER_ACTION.primary`) |
| **Secondary** | Outline or ghost — clear filters, go back |

**Filtered vs true empty:** Use different copy (Bin and My Sermons already distinguish); **layout tier is the same** (`region`).

---

## Inventory (`apps/web`)

Status as of spec authoring — implementation should move **Gap** → **Compliant**.

| Surface | File | Tier | Status | Notes |
| --- | --- | --- | --- | --- |
| Bin — empty | `app/bin/Bin.tsx` | Region | **Compliant** | `StudioEmptyState` |
| Bin — no results | `app/bin/Bin.tsx` | Region | **Compliant** | `StudioEmptyState` |
| Bin — loading / error / gate | `app/bin/Bin.tsx` | Page | **Compliant** | `StudioPageCenter` |
| My Sermons — filter empty | `SermonsTable.tsx` | Region | **Compliant** | `StudioEmptyState` |
| My Sermons — true empty | `MySermonsEmptyTableSection` | Region | **Special** | Figma table chrome; optional centered message overlay |
| My Sermons — no minister / load / error | `MySermons.tsx` | Page | **Compliant** | `StudioPageCenter` |
| Analytics — no sermon id | `AnalyticsSermonEmpty.tsx` | Panel | **Compliant** | `panelTall` |
| Analytics — breakdown helper | `AnalyticsBreakdownTable.tsx` | Panel | **Compliant** | `panelCompact` |
| Analytics — tab placeholder | `AnalyticsTabPlaceholder.tsx` | Panel | **Compliant** | `panelTall` |
| Analytics sermon — load / error | `AnalyticsSermonView.tsx` | Region | **Compliant** | `min-h-[40vh]` |
| Profile — recent sermons | `ProfileRecentSermons.tsx` | Panel | **Compliant** | `panel` |
| Profile — load error | `UserProfile.tsx` | Region | **Compliant** | `min-h-[40vh]` |
| Dashboard upload / coming soon | `Dashboard.tsx` | Region | **Compliant** | `min-h` viewport helpers |
| Studio portal error | `StudioPortal.tsx` | Page | **Compliant** | `StudioPageCenter` |
| Sermon open redirect | `SermonDetailPlaceholder.tsx` | Page | **Compliant** | loading spinner |
| Upload feed | `FeedSection.tsx` | Panel | **Compliant** | `panel` |
| Legacy welcome | `EmptySermonsState.tsx` | Page | **Gap** | marketing layout unchanged |

---

## Feature-specific references

| Feature | Empty copy / behavior | Layout tier |
| --- | --- | --- |
| [feat-0018](../feat-0018/PRODUCT.md) | First library empty — table shell Figma | Region (+ Figma chrome) |
| [feat-0019](../feat-0019/BIN_UI_PARITY_SPEC.md) | Bin empty / no-results shells | Region |
| [feat-0017](../feat-0017/PRODUCT.md) | Analytics overview zeros | Panel / cards (not full-page empty) |
| [feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md) | Select sermon prompt | Panel |

---

## Layout integration with `MY_SERMONS_PAGE`

Studio list pages (My Sermons, Bin) use:

```tsx
<div className={MY_SERMONS_PAGE.contentStack}>
  {empty ? (
    <StudioEmptyState placement="region" … />
  ) : (
    <div className={MY_SERMONS_PAGE.contentWithFooter}>…</div>
  )}
</div>
```

**Do not** render region empty as a sibling **inside** `contentScroll` below a zero-row table unless the scroll area has `flex-1` and the empty is absolutely centered in that scroll area (prefer replacing table body entirely).

---

## Acceptance criteria

- [x] `STUDIO_EMPTY_STATE` tokens exist and are documented in code.
- [x] `StudioEmptyState` component supports `page` | `region` | `panel` | `panelTall` | `panelCompact`.
- [x] Bin empty and no-results states are vertically centered in the list **region**.
- [x] My Sermons filter-empty (“Nothing here”) is region-centered.
- [x] New empty states in `apps/web` use the spec; PR review checks placement tier.
- [ ] No new empty UI uses **only** top padding without `flex-1` centering in a `contentStack` host (enforce in review).

---

## Accessibility

- Empty container should not use `aria-hidden` unless purely decorative (upload backdrop).
- Title uses appropriate heading level (`h2` or `h3`) for region/page empties.
- Focusable CTAs follow tab order after chrome.

---

## Related

- [TECH.md](./TECH.md) — implementation order
- [PRODUCT.md](./PRODUCT.md) — product summary
