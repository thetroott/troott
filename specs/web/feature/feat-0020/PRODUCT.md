# feat-0020: Sermon Get info (studio library + bin)

## Summary

Add a **Get info** action to the three-dot menus on **My Sermons** and **Bin**. It opens a read-only **Sermon info** dialog with metadata from `GET /sermon/:id`.

## Consumer

Authenticated studio users (minister / creator) managing sermons on web.

## User stories

1. As a studio user on **My Sermons**, I want **Get info** on a sermon row so I can see dates, status, and processing state without opening the upload editor.
2. As a studio user on **Bin**, I want **Get info** before I restore or empty a sermon so I can confirm which recording I am acting on.
3. As a studio user, I want to **copy** the sermon ID and **share link** (same rules as **Share** when the API has no canonical URL) from the info dialog.
4. As a studio user on **Bin**, I want **Was published** / **Was draft** plus **In bin** so I am not told the sermon is still live in the library.

## Success criteria

- **Get info** is available on every row/card kebab on `/sermons` and `/bin`.
- One shared dialog component; studio dark styling; loading and error handled.
- No new API for v1.

## Normative spec

See **[SERMON_GET_INFO_SPEC.md](./SERMON_GET_INFO_SPEC.md)**.

## Related

- feat-0019 — bin UI parity (`BIN_UI_PARITY_SPEC.md`)
- feat-0018 — upload pipeline status labels
- feat-0022 — sermon **Edit** vs **Get info** (`../feat-0022/SERMON_EDIT_SPEC.md`)
