# feat-0026 — Technical notes (empty state layout)

## Proposed shared modules

| Module | Role |
| --- | --- |
| `apps/web/src/components/shared/studio/studio-empty-state-ui.ts` | `STUDIO_EMPTY_STATE` layout class tokens |
| `apps/web/src/components/shared/studio/StudioEmptyState.tsx` | Wrapper: `title`, `description`, `children`, `placement` |
| `apps/web/src/components/shared/studio/StudioPageCenter.tsx` | Full-height page shell for page-tier states |

## `StudioEmptyState` API (target)

```tsx
type StudioEmptyPlacement = 'page' | 'region' | 'panel';

type StudioEmptyStateProps = {
  placement?: StudioEmptyPlacement;
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode; // CTA row
  className?: string;
};
```

- **`page`** — outer wrapper uses `STUDIO_EMPTY_STATE.page`.
- **`region`** — default for list/table hosts (`contentStack` child).
- **`panel`** — analytics cards, breakdown table footer, modals.

## Refactor order (suggested)

1. ~~Add tokens + `StudioEmptyState`.~~ **Done**
2. ~~**Bin** — `isEmptyBin` / `isNoResults` + page loading/error.~~ **Done**
3. ~~**SermonsTable** — filter-empty (`Nothing here`).~~ **Done**
4. ~~**Analytics** — `AnalyticsSermonEmpty`, breakdown helper, tab placeholder.~~ **Done**
5. ~~**MySermons** / **Dashboard** / **Profile** / **StudioPortal** page-level states.~~ **Done**
6. Remaining: `EmptySermonsState` (legacy marketing page), true-empty My Sermons Figma table overlay (optional).

## Testing

- Visual: empty Bin, filtered-empty Bin, filtered-empty My Sermons, Analytics sermon tab without `sermonId`, breakdown segment with no rows.
- Narrow viewport: empty block remains centered (no horizontal overflow).
- With pagination visible: region empty sits **above** pagination bar, centered in scroll area only.

## Out of scope

- Mobile app (`apps/mobile`).
- Empty states inside third-party primitives only (e.g. `CommandEmpty`) unless product asks for custom centering inside popovers.
