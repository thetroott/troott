# feat-0020: Sermon Get info — TECH

## Normative spec

**[SERMON_GET_INFO_SPEC.md](./SERMON_GET_INFO_SPEC.md)**

## Touchpoints

| Area | Files (planned) |
| --- | --- |
| Dialog | `apps/web/src/components/shared/sermon/SermonGetInfoDialog.tsx` |
| Mapping | `apps/web/src/utils/sermon-info-map.util.ts` — `mapSermonDetailToInfoView`, `resolveStudioSermonShareLink` |
| Menus | `SermonContextMenu.tsx`, `BinContextMenu.tsx` |
| Hosts | `SermonsTable.tsx`, `Bin.tsx` |
| Query | `useSermonByIdQuery` in `apps/web/src/hooks/app/useSermon.ts` |
| API | `GET /api/v1/sermon/:id` — `apps/api/src/routes/sermon.router.ts` |

## Implementation order

1. `SermonGetInfoDialog` + field mapping util
2. Wire `SermonsTable` (`onGetInfo` + state)
3. Wire `Bin.tsx`
4. Update `SermonContextMenu` and `BinContextMenu` menu items
5. Manual test plan from spec

## feat-0019 follow-up

When implementing, update `BIN_UI_PARITY_SPEC.md` row menu table to include **Get info** as first item.
