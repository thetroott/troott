# Mobile specs (listener app)

Product and technical specifications for **`apps/mobile`** (Expo listener app). Structure mirrors [`specs/web`](../web/README.md): numbered UX inventories plus **`feature/feat-NNNN/`** contracts with `PRODUCT.md` (behavior) and `TECH.md` (implementation map).

## Master journey (cross-platform UX)

| Document | Role |
| -------- | ---- |
| [`specs/api/mobile-flow.md`](../api/mobile-flow.md) | End-to-end listener states, navigation, play/save/share flows |
| [`specs/api/deep-links.md`](../api/deep-links.md) | Universal links, pending targets, teaser routes |
| [`specs/api/search.md`](../api/search.md) | Search API semantics (mobile Search feat references this) |

## Feature specs (`feature/`)

| ID | Topic | PRODUCT | TECH | UX inventory |
| -- | ----- | ------- | ---- | -------------- |
| feat-0001 | Authentication & session | [PRODUCT](./feature/feat-0001/PRODUCT.md) | [TECH](./feature/feat-0001/TECH.md) | [`00 - auth.md`](./00%20-%20auth.md), [`00 - security.md`](./00%20-%20security.md) |
| feat-0002 | Listener onboarding | [PRODUCT](./feature/feat-0002/PRODUCT.md) | [TECH](./feature/feat-0002/TECH.md) | [`00 - onboarding.md`](./00%20-%20onboarding.md) |
| feat-0003 | Tab shell & navigation | [PRODUCT](./feature/feat-0003/PRODUCT.md) | [TECH](./feature/feat-0003/TECH.md) | [`00 - home.md`](./00%20-%20home.md) (shell sections) |
| feat-0004 | Playback engine & player | [PRODUCT](./feature/feat-0004/PRODUCT.md) | [TECH](./feature/feat-0004/TECH.md) | [`01 - engine.md`](./01%20-%20engine.md), [`02 - continue-listening.md`](./02%20-%20continue-listening.md) |
| feat-0005 | Home & discovery rails | [PRODUCT](./feature/feat-0005/PRODUCT.md) | [TECH](./feature/feat-0005/TECH.md) | [`00 - home.md`](./00%20-%20home.md) |
| feat-0006 | Search & discover | [PRODUCT](./feature/feat-0006/PRODUCT.md) | [TECH](./feature/feat-0006/TECH.md) | [`07 - search.md`](./07%20-%20search.md) |
| feat-0007 | Library & playlists | [PRODUCT](./feature/feat-0007/PRODUCT.md) | [TECH](./feature/feat-0007/TECH.md) | [`03 - library.md`](./03%20-%20library.md), [`04 - playlist.md`](./04%20-%20playlist.md) |
| feat-0008 | Sharing | [PRODUCT](./feature/feat-0008/PRODUCT.md) | [TECH](./feature/feat-0008/TECH.md) | [`05 - sharing.md`](./05%20-%20sharing.md) |
| feat-0009 | Profile, notifications & account | [PRODUCT](./feature/feat-0009/PRODUCT.md) | [TECH](./feature/feat-0009/TECH.md) | [`08 - profile.md`](./08%20-%20profile.md), [`06 - nofications.md`](./06%20-%20nofications.md) |
| feat-0010 | State ownership (Context vs TanStack vs Zustand) | [PRODUCT](./feature/feat-0010/PRODUCT.md) | [TECH](./feature/feat-0010/TECH.md) | [`09 - context.md`](./09%20-%20context.md) |
| feat-0011 | React context slices (user, auth, app, session) | [PRODUCT](./feature/feat-0011/PRODUCT.md) | [TECH](./feature/feat-0011/TECH.md) | [`09 - context.md`](./09%20-%20context.md) |
| feat-0012 | Build hygiene & favorites edge cases | [PRODUCT](./feature/feat-0012/PRODUCT.md) | [TECH](./feature/feat-0012/TECH.md) | — |

### API wiring backlog (UI ready, hooks/clients partial)

| ID | Topic | PRODUCT | TECH |
| -- | ----- | ------- | ---- |
| feat-0013 | Favorites → library API sync | [PRODUCT](./feature/feat-0013/PRODUCT.md) | [TECH](./feature/feat-0013/TECH.md) |
| feat-0014 | Share URLs from API / `shareableUrl` | [PRODUCT](./feature/feat-0014/PRODUCT.md) | [TECH](./feature/feat-0014/TECH.md) |
| feat-0015 | Server playback progress | [PRODUCT](./feature/feat-0015/PRODUCT.md) | [TECH](./feature/feat-0015/TECH.md) |
| feat-0016 | Minister profile API | [PRODUCT](./feature/feat-0016/PRODUCT.md) | [TECH](./feature/feat-0016/TECH.md) |
| feat-0017 | Topic browse (`GET /sermon/topic/:topic`) | [PRODUCT](./feature/feat-0017/PRODUCT.md) | [TECH](./feature/feat-0017/TECH.md) |
| feat-0018 | Sermon detail / player by ID | [PRODUCT](./feature/feat-0018/PRODUCT.md) | [TECH](./feature/feat-0018/TECH.md) |
| feat-0019 | Minister & series pickers | [PRODUCT](./feature/feat-0019/PRODUCT.md) | [TECH](./feature/feat-0019/TECH.md) |
| feat-0020 | Invitation flows (client inventory) | [PRODUCT](./feature/feat-0020/PRODUCT.md) | [TECH](./feature/feat-0020/TECH.md) |

**Excluded (separate product tracks):** offline download, subscription/billing.

**Related web specs:** Admin login on mobile is defined in [`specs/web/feature/feat-0003`](../web/feature/feat-0003/PRODUCT.md). Minister/creator onboarding and studio are **web-only** (`specs/web/feature/feat-0005`).

## Implementation inventories (`apps/mobile/docs`)

| Doc | Purpose |
| --- | ------- |
| [`mobile-action-inventory.md`](../../apps/mobile/docs/mobile-action-inventory.md) | Canonical action ids → handlers |
| [`mobile-action-api-matrix.md`](../../apps/mobile/docs/mobile-action-api-matrix.md) | Actions → API endpoints |
| [`mobile-route-action-trace.md`](../../apps/mobile/docs/mobile-route-action-trace.md) | Route-by-route traces |

## Context layout (`apps/mobile/context`)

Matches web: each slice is **`{slice}Context`**, **`{slice}Reducer`**, **`{slice}State`**, **`types`** only. Hooks live on `*State.tsx`. Session also has `SessionHydrator.tsx` (web parity).

| Slice | Responsibility |
| ----- | -------------- |
| `user/` | Session user, listener profile |
| `auth/` | Register + forgot-password wizards (`useRegisterAuth` from `authState`) |
| `app/` | First-time user, app loading |
| `session/` | `refreshSession`, cold-start hydrator |
| `apps/app.context.tsx` | `useContextType()`, playback/queue dispatch no-ops |

See [feat-0011](./feature/feat-0011/PRODUCT.md) (slices) and [feat-0010](./feature/feat-0010/PRODUCT.md) (boundaries). Web reference: [`apps/web/src/context`](../../apps/web/src/context).

## Zustand outside Context (`lib/` + `engine/state/`)

| Path | Responsibility |
| ---- | -------------- |
| `engine/state/player-ui-store.ts` | Full-player visibility, return path (queue in `player-queue-store`) |
| `lib/state/share-flow.ts` | Share overlay step machine |
| `lib/state/network-store.ts` | NetInfo sync |
| `lib/preferences/*` | Persisted app, swipe, usage, developer settings |

## How to extend

1. Add or change **behavior** in `feature/feat-NNNN/PRODUCT.md` (numbered invariants).
2. Map files and gaps in `feature/feat-NNNN/TECH.md`.
3. Keep screen-level UX detail in the numbered `00`–`08` docs or `specs/api/mobile-flow.md` when the change is interaction-heavy.
