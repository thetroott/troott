# feat-0022: Studio sermon edit (row menu + lifecycle)

## Summary

Define when and how studio users **edit** sermons from **My Sermons** (`/studio/{studioCode}/sermons`): the three-dot **Edit** action, lifecycle actions, and metadata surfaces. **Routing** (draft → upload wizard vs published → **Sermon details**) is normative in **[feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)**. This feature documents fields, API, and in-page behavior once the user is on the correct surface.

This feature unifies scattered docs (`04 - sermon-upload-draft`, `05 - sermon-view-trash`, feat-0019 UC-U03/U04) into one web implementation contract.

## Consumer

Authenticated **minister** or **creator** with studio access.

## User stories

1. As a user with a **draft**, I want **Edit** on a row to open the **upload wizard** so I can finish audio, metadata, and publish ([feat-0025](../feat-0025/PRODUCT.md)).
2. As a user with a **published** sermon, I want **Edit** to open **Sermon details** so I can change title, description, thumbnail, and visibility without upload steps.
3. As a user, I want **Rename** for a quick title-only change without opening the full wizard.
4. As a user, I want clear rules when **audio replace** is allowed (draft vs published, processing in flight).
5. As a user, I want **Edit** unavailable in the **Bin** (restore first, then edit in library).

## Success criteria

- **Edit** on `/sermons` always opens a deterministic, server-backed update flow.
- Draft vs published capabilities are explicit and match API policy.
- **Rename** remains a lightweight alternative to full **Edit**.
- Bin rows do not offer **Edit** (feat-0019).

## Normative spec

See **[SERMON_EDIT_SPEC.md](./SERMON_EDIT_SPEC.md)**.

## Related

- [feat-0025](../feat-0025/PRODUCT.md) — **Edit** routing (draft wizard vs published details)
- [feat-0018](../feat-0018/PRODUCT.md) — upload wizard
- [feat-0019](../feat-0019/PRODUCT.md) — library + bin CRUD
- [feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md) — read-only Get info
- [feat-0021](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md) — list visibility (complements metadata edit)
- [`04 - sermon-upload-draft.md`](../../04%20-%20sermon-upload-draft.md)
- [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md)
