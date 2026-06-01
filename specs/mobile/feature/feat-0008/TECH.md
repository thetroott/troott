# feat-0008: Tech Spec — Sharing

## Context

See [`PRODUCT.md`](./PRODUCT.md).

### State and entry

| Concern | Path |
| ------- | ---- |
| Share store | `lib/state/share-flow.ts` — `useShareFlow`, `openShareFlow` |
| Root overlay | `app/_layout.tsx` — `ListenerSharingFlow`, Instagram/copy/native handlers |
| Types | `components/features/share/share-types.ts` |

### UI

| Component | Path |
| --------- | ---- |
| Flow | `components/features/share/listener-sharing-flow.tsx` |
| Sheet | `components/features/share/listener-share-sheet.tsx` |

### Call sites

| Source | Path |
| ------ | ---- |
| Player actions | `track-actions-controller.tsx`, `controls/actions.tsx` |
| Inventory | `apps/mobile/docs/mobile-action-inventory.md` — `share.*` actions |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–2, 6 | `lib/state/share-flow.ts`, `ListenerSharingFlow` |
| 3–5 | `_layout.tsx` handlers + `Share` / `expo-sharing` |
| 7 | `lib/deep-link/*` |
| 8 | `DEFAULT_TRACK` in share store |
