# feat-0028 — Technical notes (sidebar search)

## Current code

| File | Role |
| ---- | ---- |
| [`Search.tsx`](../../../../apps/web/src/components/shared/dialog/Search.tsx) | Sidebar trigger + `CommandDialog` (placeholder content) |
| [`Sidebar.tsx`](../../../../apps/web/src/components/shared/navigation/Sidebar.tsx) | Renders `SearchForm` below logo |
| [`navdata.tsx`](../../../../apps/web/src/_data/navdata.tsx) | Main + Admin nav titles/urls/icons/roles |
| [`sidebar-nav.util.ts`](../../../../apps/web/src/utils/sidebar-nav.util.ts) | Group + item visibility by `UserType` |
| [`studio-nav.util.ts`](../../../../apps/web/src/utils/studio-nav.util.ts) | `resolveStudioNavUrl`, `getStoredStudioCode` |
| [`onboarding.tsx`](../../../../apps/web/src/_data/onboarding.tsx) | Get Started hub + sub-step titles/actions |
| [`useMinisterSermonsQuery`](../../../../apps/web/src/hooks/app/useSermon.ts) | List fetch with `q`, `status` |
| [`useCreateSermonEntry`](../../../../apps/web/src/hooks/upload/useCreateSermonEntry.ts) | Create sermon modal entry |

## Proposed structure

```
apps/web/src/
  constants/sidebar-search-index.ts   # static SearchIndexItem[] (generated or hand-maintained)
  utils/sidebar-search.util.ts        # filterByRole, filterByQuery, resolveHref, disabledReason
  hooks/app/useSidebarSearch.ts       # open state, debounced sermon query, select handler
  components/shared/dialog/
    Search.tsx                        # thin shell — delegates to SidebarSearchCommand
    SidebarSearchCommand.tsx          # CommandDialog groups + dynamic sermon rows
```

### `SearchIndexItem` shape (normative)

```ts
type SearchIndexKind =
  | 'navigation'
  | 'action'
  | 'onboarding'
  | 'upload-step'
  | 'settings-section'
  | 'sermon'; // dynamic only

type SearchIndexItem = {
  id: string;
  kind: SearchIndexKind;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: LucideIcon;
  roles: UserType[]; // empty = inherit group
  /** When true, only show while onboarding incomplete (Get Started visible). */
  onboardingOnly?: boolean;
  /** When true, hide while onboarding incomplete (studio destinations). */
  requiresOnboardingComplete?: boolean;
  /** Resolve path at runtime (studio code injection). */
  href: string | ((ctx: SidebarSearchContext) => string | null);
  /** action = run callback instead of navigate (Create sermon). */
  run?: (ctx: SidebarSearchContext) => void;
  group: 'Navigation' | 'Actions' | 'Get Started' | 'Upload wizard' | 'Settings' | 'Sermons';
};
```

`SidebarSearchContext`: `{ userType, studioCode, onboardingComplete, navigate, openCreateSermon }`.

### Static index source of truth

1. **Prefer** deriving Main/Admin navigation rows from the same metadata as `navdata.tsx` (single edit point).
2. Append onboarding rows from `OnboardingItems` (+ nested `steps`).
3. Append upload wizard step rows (mirror `onboarding.tsx` item 4 `steps`).
4. Append settings section rows (titles from [feat-0012](../feat-0012/PRODUCT.md); v1 navigates to `/settings` only).

Do **not** duplicate role matrices — call `isSidebarGroupVisibleForUser`, Get Started gating from sidebar, and `resolveStudioNavUrl`.

### Dynamic sermon search

```ts
useMinisterSermonsQuery(ministerId, {
  page: 1,
  limit: 8,
  q: debouncedQuery,
  status: includeBin ? undefined : 'active', // or separate bin pass — see spec
}, { enabled: debouncedQuery.length >= 2 && Boolean(ministerId) });
```

- Debounce **300 ms**.
- Minimum query length **2** characters for API group.
- Map rows to palette items with subtitle `{draft|published|bin} · {date}`.
- On select: `navigateOnSermonEdit(sermon)` from feat-0025 util when kind = open; optional secondary rows for Analytics (published only).

### Create sermon action

Reuse `useCreateSermonEntry().openCreateSermonModal()` (same as My Sermons **Create sermon**). Close palette before opening modal.

### Keyboard

- Global **⌘K** / **Ctrl+K**: toggle palette (keep existing listener in `Search.tsx`).
- **Escape**: close (cmdk default).
- Do **not** register conflicting shortcuts for placeholder ⌘N / ⌘I / ⌘B.

### Accessibility

- Trigger: `aria-label="Search"` (exists).
- Dialog: cmdk roving tabindex; group headings as `CommandGroup heading`.
- Disabled items: `aria-disabled`, visible reason in subtitle or tooltip.

## Implementation phases

| Phase | Scope |
| ----- | ----- |
| **P1** | Static navigation + actions; remove placeholders; role + onboarding gates |
| **P2** | Debounced sermon title search + feat-0025 navigation |
| **P3** | Settings section rows; sermon Analytics secondary result |
| **P4** | Recent items (localStorage); admin content when APIs exist |

## Tests

| Test | Type |
| ---- | ---- |
| `filterSearchIndexByRole` | unit |
| `resolveSearchItemHref` with/without studio code | unit |
| Onboarding incomplete hides studio nav items | unit |
| Debounced query does not fire below min length | hook test optional |

## Files to touch (implementation)

- `Search.tsx` — wire context, remove stub groups
- New files above
- Optional: export shared nav builder from `navdata` or `sidebar-nav.util.ts`
- Cross-link [feat-0002 TECH](../feat-0002/TECH.md) search section when added

## Acceptance (engineering)

1. `pnpm exec tsc --noEmit -p apps/web` passes.
2. Manual: minister sees 7 Main nav targets + Create sermon; admin sees Admin only.
3. Manual: typing sermon title returns API matches; Enter navigates and closes dialog.
4. No navigation on palette open alone.
