---
name: troott-mobile-three-layer
description: >-
  Troott mobile (`apps/mobile`) architecture: API client method, React Query hook,
  component only. No extra lib parse/map helpers, no thin utils, no new folders for
  one-off abstraction. Use when adding or refactoring mobile features, hooks, lib
  files, or when the user mentions mobile structure, parse helpers, or over-abstraction.
---

# Troott mobile — three layers only

## The rule

No encapsulation or abstraction. **THE RULE is API CALL FN, HOOK FN, COMPONENT.**

```
api/clients/*.ts   →  api/hooks/app/*.ts   →  app/** + components/**
     (HTTP)              (TanStack Query)         (UI)
```

## Do

1. **API client** — one method per endpoint on `BaseService` subclasses. Paths in `api/config/path.ts`.
2. **Hook** — call `api.*`, check `res.error`, throw or return `res.data`. Auth navigation, deep-link pending targets, and MMKV side effects live in **`useAuth.ts`** or the hook that owns the mutation.
3. **Component** — consume hooks; render UI; local UI state and display-only `useMemo` only.

**Session routing** — `context/session/AuthSessionRouting.tsx` (auth guards, 401 listener, deep-link capture). Not a separate `lib/` layer.

## Allowed `lib/` (global infra only)

- `lib/zstore.ts` — Zustand factory used by stores
- `lib/state/network-store.ts`, `lib/state/share-flow.ts` — app-wide UI state
- `lib/preferences/*` — persisted settings stores

## Do not

- Add `lib/*-map.ts`, `parse*.ts`, `normalize*.ts`, `auth-*.util.ts`, `*-routes.ts`, or one-screen `ensure*` helpers.
- Add `api/utils/*`, `api-response.util.ts`, or other thin API wrappers — session sync belongs in `useUser.ts`; envelope toasts in `useAuth.ts`.
- Add `apps/mobile/types/` re-export barrels — import from `@/api/dtos/*` in hooks, components, and engine code.
- Add `apps/mobile/utils/` — use `api/types`, hook files, or inline in components.
- Split hook logic into `lib/` — keep it in the hook file or the owning route component.
- Create new folders/files for a single feature when an existing hook or route file can hold the code.

## Hook pattern

```ts
export function useSomethingQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.domain.key(),
    queryFn: async () => {
      const res = await api.domain.getSomething();
      if (res.error) {
        throw new Error(res.message || 'Request failed');
      }
      return res.data;
    },
    enabled,
  });
}
```

## Reference

- [`apps/mobile/api/README.md`](../../../apps/mobile/api/README.md)
