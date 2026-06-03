# feat-0021: My Sermons — list visibility column

## Summary

Studio users can see and change sermon visibility (**Public**, **Private**, **Unlisted**) directly from the My Sermons **list** view without opening the upload wizard.

## Consumer

Minister and creator on `/studio/{studioCode}/sermons`.

## Canonical spec

Full UX, API, cross-surface contract, and acceptance criteria: [`SERMON_LIST_VISIBILITY_SPEC.md`](./SERMON_LIST_VISIBILITY_SPEC.md).

## In scope (v1)

- Visibility column + hover chevron + change modal on list view
- API `visibility` enum (prerequisite)
- Alignment with upload listener settings and feat-0020 Get info (read-only visibility row)

## Non-goals

Grid visibility, bin column, bulk visibility, toolbar visibility filter, context-menu entry (v1.1), mobile.

## Related

- [feat-0018](../feat-0018/PRODUCT.md)
- [feat-0019](../feat-0019/PRODUCT.md)
- [feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md)
- [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md#uc-v5)
