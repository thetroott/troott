# feat-0027: Upload modal as canonical **draft** editor

## Summary

For **unpublished** sermons, the **upload wizard** (`UploadModal` on `SermonUploadPage`) is the only full editor: metadata, listener settings, audio lifecycle, and publish/draft actions. It must **retain and restore state** across wizard steps, URL segments, close/reopen, and resume from the server.

**Published** sermons edit on **Sermon details** (`SermonEditPage`) per [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md). This feat defines **what the modal must do** once routing lands users on the wizard for drafts.

## Problem

| Area | Gap |
| ---- | --- |
| Product split | feat-0018 describes the wizard; feat-0022 added Sermon details — draft behavior was ambiguous |
| State | Server resume hydrates only part of `ISermonUpload`; `File` cannot persist in localStorage |
| Close / reopen | Auto-save on close exists but is not fully specified vs in-progress upload |
| New vs resume | Create flow and `resumeSermonId` share one modal but different entry rules |

## Consumer

Authenticated **minister** or **creator** editing a **draft** sermon in studio (`/studio/{code}/sermons/upload/...`).

## Normative spec

[DRAFT_UPLOAD_MODAL_SPEC.md](./DRAFT_UPLOAD_MODAL_SPEC.md)

## Related

| Doc | Role |
| --- | ---- |
| [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md) | Draft **Edit** → wizard (routing) |
| [feat-0018](../feat-0018/PRODUCT.md) | Wizard steps, library, Figma |
| [feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) | `item.uploadStatus` polling in modal |
| [04 - sermon-upload-draft](../../04%20-%20sermon-upload-draft.md) | Legacy UC-U1–U6 |
| [feat-0022](../feat-0022/SERMON_EDIT_SPEC.md) | Published edit (not this modal) |

## Definition of done

- [ ] Spec accepted: all use cases in DRAFT_UPLOAD_MODAL_SPEC have pass/fail criteria.
- [ ] Resume hydrates full draft fields needed for edit (visibility, thumbnail URL, `uploadRef`, series).
- [ ] Wizard state survives step changes and URL sync without losing in-memory edits.
- [ ] Close/reopen and mid-upload policies match spec (no silent data loss beyond documented rules).
- [ ] Published sermons never use this modal as primary editor (feat-0025 enforced).
