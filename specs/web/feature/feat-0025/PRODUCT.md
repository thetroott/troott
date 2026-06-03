# feat-0025: Sermon **Edit** routing — draft (upload wizard) vs published (Sermon details)

## Summary

When a studio user chooses **Edit** on a sermon, the app must open the **correct surface** based on publication state:

- **Draft** → **upload wizard** (`UploadModal` on `SermonUploadPage`), hydrated from the server (`resumeSermonId`).
- **Published** → **Sermon details** full-page editor (`SermonEditPage` at `/studio/{code}/sermons/{id}/edit`).

This removes the current mismatch where every **Edit** opens `SermonEditPage` while legacy docs still describe the wizard as the draft editor.

## Consumer

Authenticated **minister** or **creator** with studio access.

## User stories

1. As a user with a **draft**, I want **Edit** to open the **upload modal** where I left off (audio, details, publish) — not a separate details page that duplicates the wizard.
2. As a user with a **published** sermon, I want **Edit** to open **Sermon details** (YouTube Studio–style) so I can update metadata and visibility without walking through upload steps.
3. As a user, I want a bookmark or email link to `/sermons/:id/edit` to land on the right surface after the server loads the sermon.
4. As a user replacing audio on a **published** sermon, I still enter only the wizard **file** step from Sermon details (**Replace audio**), not the full draft flow.

## Success criteria

- Row **Edit** on `/sermons` routes to upload (draft) or `SermonEditPage` (published) using the same draft detection as the list.
- `/studio/{code}/sermons/:id/edit` **redirects** drafts to the upload wizard with `resumeSermonId` (`replace: true`).
- `/studio/{code}/sermons/:id/resume` and legacy `/sermons/:id` use the same resolver (draft → wizard; published → edit).
- **Rename**, **Get info**, **Analytics**, and **Replace audio** (from published edit) keep their existing contracts ([feat-0022](../feat-0022/PRODUCT.md), [feat-0023](../feat-0023/PRODUCT.md)).
- **Bin** rows never offer **Edit**.

## Normative spec

See **[SERMON_EDIT_ROUTING_SPEC.md](./SERMON_EDIT_ROUTING_SPEC.md)**.

## Related

- [feat-0022](../feat-0022/PRODUCT.md) — sermon edit lifecycle, metadata fields, API map
- [feat-0018](../feat-0018/PRODUCT.md) — upload wizard, progress polling
- [feat-0023](../feat-0023/PRODUCT.md) — single-sermon analytics workspace (`/sermons/:id/analytics`)
- [feat-0019](../feat-0019/PRODUCT.md) — library + bin
