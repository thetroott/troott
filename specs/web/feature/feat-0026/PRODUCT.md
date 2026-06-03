# feat-0026: Web empty states — centered layout

## Summary

Every **empty state** in `apps/web` (no data, no results, first-use, or “pick something”) must be **visually centered** within its placement boundary: the **page**, the **content region** below page chrome, or a **nested component** (card, table body, dialog panel).

Users should not see empty copy hugging the top-left of a large blank area while the rest of the viewport stays unused.

## Consumer

All studio portal surfaces (`apps/web`): ministers, creators, admins.

## User stories

1. As a user on an **empty Bin**, I want the message in the **middle** of the list area so it is easy to read without scanning the top of the page.
2. As a user with **no sermons** and active filters, I want the “Nothing here” state **centered** in the table region, not only below the table header.
3. As a user on **Analytics** with no sermon selected, I want the prompt **centered** in the tab body.
4. As a developer, I want one **normative layout contract** and shared tokens so new features do not invent one-off empty positioning.

## Success criteria

- Normative spec defines **three placement tiers** and required CSS/layout patterns.
- Shared `STUDIO_EMPTY_STATE` tokens (and optional `StudioEmptyState` component) documented for implementation.
- Inventory lists major `apps/web` empty surfaces and marks **compliant** vs **gap**.
- New empty UI uses the shared pattern; refactors align existing gaps in follow-up implementation.

## Normative spec

See **[EMPTY_STATE_LAYOUT_SPEC.md](./EMPTY_STATE_LAYOUT_SPEC.md)**.

## Related

- [feat-0018](../feat-0018/PRODUCT.md) — My Sermons empty table (Figma `10154:35090`)
- [feat-0019](../feat-0019/PRODUCT.md) — Bin empty / no-results
- [feat-0017](../feat-0017/PRODUCT.md) — Analytics overview empty
- [feat-0023](../feat-0023/PRODUCT.md) — Single-sermon analytics empty
