# feat-0021: Tech — list visibility column

## Context

See [`SERMON_LIST_VISIBILITY_SPEC.md`](./SERMON_LIST_VISIBILITY_SPEC.md).

## API prerequisite

Implement `SermonVisibility` on API before web **Unlisted** ships. Includes schema, migration, mapper, `update` + `publish`, minister list response. See spec sections **Required API addition** and **Cross-surface visibility contract**.

## Web touchpoints

| File | Change |
| --- | --- |
| `SermonsListView.tsx` | Visibility column |
| `MySermonsEmptyShell.tsx` / `MySermonsEmptyTableSection.tsx` | Empty header column |
| `SermonVisibilityCell.tsx` | New |
| `SermonChangeVisibilityDialog.tsx` | New — single instance in `SermonsTable` |
| `sermon-list-map.util.ts` | `visibility` on row |
| `sermon-visibility.util.ts` | New — shared normalize/labels |
| `ListenerSettings.tsx` | Send `visibility` when API ships |
| `useSermon.ts` | `useUpdateSermonMutation` with `{ visibility }` |
| `sermon.dto.ts` | Types when API lands |

## Cross-feat

- [feat-0020 SERMON_GET_INFO_SPEC](../feat-0020/SERMON_GET_INFO_SPEC.md) — add **Visibility** read-only row when API ships

## Validation

See spec **Test plan (manual)** and **Acceptance criteria** checklists.

## Related

- [feat-0006 TECH](../../../api/feature/feat-0006/TECH.md)
- [feat-0018 TECH](../feat-0018/TECH.md)
