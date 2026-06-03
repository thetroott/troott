# feat-0022: Studio sermon edit — TECH

## Normative spec

**[SERMON_EDIT_SPEC.md](./SERMON_EDIT_SPEC.md)**

## Touchpoints (planned / existing)

| Area | Files |
| --- | --- |
| Row menu | `SermonsTable.tsx`, `SermonContextMenu.tsx` |
| Edit page | `SermonEditPage.tsx`, `sermon-edit-ui.ts`, `sermon-edit-form.util.ts` |
| Routes | `paths.ts` (`studioSermonEditPath`), `studio.route.tsx` |
| Legacy redirects | `SermonDetailPlaceholder.tsx` → edit |
| Audio replace | `SermonUploadPage.tsx` (file step + `resumeSermonId`) |
| Quick title | `SermonsTable` rename dialog, `useUpdateSermonMutation` |
| API | `PUT /sermon/update/:id`, `POST /sermon/publish/:id`, cover upload |
| Utils | `sermon-visibility.util.ts`, `useSermonByIdQuery` |

## Implementation order

1. `SermonEditPage` + `studioSermonEditPath` + row **Edit** navigation.
2. Save (`PUT /update`), draft/publish (`POST /publish`), visibility downgrade confirm.
3. Replace audio → wizard file step; fix wizard `fetchSermonDetail` hydration (no double `data` unwrap).
4. Processing banner + block publish/visibility while pipeline non-terminal.

## Cross-feature

- **Get info** (feat-0020): read-only; does not replace **Edit**.
- **Bin** (feat-0019): no **Edit** on `BinContextMenu`.
- **List visibility** (feat-0021): may update visibility via list modal or wizard settings step — single source for `isPublic` / unlisted when enum lands.
