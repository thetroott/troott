# feat-0010: Tech Spec — State ownership

## Context

See [`PRODUCT.md`](./PRODUCT.md). **Slice files and hooks:** [feat-0011 TECH](./feat-0011/TECH.md).

---

## Ownership table

| State | Owner | Path |
| ----- | ----- | ---- |
| Session user, listener | Context user slice | `context/user/` — [feat-0011](../feat-0011/TECH.md) |
| Register / forgot wizards | Context auth slice | `context/auth/` |
| First-time user, app loading | Context app slice | `context/app/` |
| Session hydrate / refresh | **Removed** (feat-0004) — lazy `useCurrentUserQuery`; see [feat-0004](../../api/feature/feat-0004/PRODUCT.md) |
| Library / search / playlist rows | TanStack | `api/hooks/app/useLibrary.ts`, `useSearch`, `usePlaylist` |
| Play queue, transport | Zustand + mutations | `engine/state/player-queue-store.ts`, `useControl.ts` |
| Share overlay | Zustand | `lib/state/share-flow.ts` |
| NetInfo | Zustand | `lib/state/network-store.ts` |
| Settings | Zustand | `lib/preferences/app.ts` |

---

## Hydration flows

| Flow | Context | Query |
| ---- | ------- | ----- |
| Login | `userContext.setResource(GET_LOGGEDIN_USER, …)` | `queryKeys.auth.user()` |
| Cold start | Lazy `useCurrentUserQuery` when screens mount | `users.me()` / `listener.me()` |
| Logout | Clear via `useAuth` + navigation | `removeQueries` / invalidate |

| File | Role |
| ---- | ---- |
| `api/hooks/app/useAuth.ts` | persist session |
| `api/hooks/app/useUser.ts` | `useContextType` |
| `api/utils/map-api-user.ts` | API → context |

---

## Anti-patterns

| Reject | Use |
| ------ | --- |
| Queue in Context reducer | `player-queue-store` |
| Zustand auth forms | feat-0011 `useRegisterAuth` |
| `useQuery(me)` without context write | `setResource` pattern |
| Zustand under `context/` | `lib/` or `engine/state/` |

---

## PRODUCT mapping

| Behaviors | Layer |
| --------- | ----- |
| 1–2 | feat-0011 Context |
| 3–5 | TanStack `api/hooks` |
| 6–9 | `engine/state`, `useControl` |
| 10–13 | `lib/state`, `lib/preferences`, `player-ui-store` |
| 14 | `app.context.tsx` no-ops |
| 15 | N/A web roles |

---

## Related feature specs

| Spec | Uses |
| ---- | ---- |
| [feat-0011](../feat-0011/TECH.md) | Context slice files |
| [feat-0004](../feat-0004/TECH.md) | Engine |
| [feat-0006](../feat-0006/TECH.md) | TanStack search + `userContext` |
| [feat-0007](../feat-0007/TECH.md) | TanStack library + `userContext` |
| [feat-0009](../feat-0009/TECH.md) | Profile + `lib/preferences` |
