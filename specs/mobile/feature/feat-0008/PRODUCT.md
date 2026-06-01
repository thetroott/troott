# feat-0008: Sharing (listener)

## Summary

Listeners share sermons (and related entities) via a **global share flow**: bottom sheet steps, copy link, Instagram-oriented share, and native share. Root layout hosts `ListenerSharingFlow` driven by Zustand. Complements [`05 - sharing.md`](../../05%20-%20sharing.md) and [`specs/api/deep-links.md`](../../../api/deep-links.md).

## Problem

Share is triggered from sermon cards, player actions, and root overlay. Without a contract, duplicate modals or missing track metadata break outbound links.

## Non-goals

- Building universal link infrastructure (see API deep-links spec).
- Web share widgets.

## Consumer

Signed-in listeners sharing in-app content.

## Behavior

1. `openShareFlow(track?)` opens overlay with sermon title, minister, artwork defaults.
2. Steps include listener sheet, copy confirmation, optional Instagram path.
3. **Copy** writes URL/message to clipboard + feedback step.
4. **Native share** uses `Share` / `expo-sharing` when available.
5. **Instagram** path uses configured message + URL handler in root layout.
6. Close dismisses overlay and resets step to default.
7. Recipients opening links follow deep-link spec (sign-in, pending target).
8. Share requires sensible fallbacks when `id` null (placeholder copy only for dev).

## Related docs

- [`TECH.md`](./TECH.md)
