# ADR 0001: Music app state domains (`@troott/state`)

## Status

Accepted (implemented).

## Context

The package previously exposed two monolithic `useReducer` providers (`UserState`, `AppState`) with stringly-typed `GET_*` / `SET_*` actions and overlapping concerns (identity, profile, lists, shell UI).

## Decision

1. **Per-domain providers** under `packages/state/src/domains/<domain>/` using `useReducer` + split React Context (`createDomainContext`), composed by a single **`TroottStateProvider`** in documented order (auth through UI). See `TroottStateProvider.tsx`.

2. **Legacy compatibility**: `compat/LegacyCompatContexts.tsx` derives the previous **`IUserContext` / `IAppContext`** shapes from domain hooks and provides the existing `UserContext` / `AppContext` instances so **`useContextType`**, **`useUserSelector`**, and **`useAppSelector`** keep working without migrating every call site immediately.

3. **List/resource cache**: Legacy collection dispatch (`GET_SERMONS`, `GET_USERS`, …) lives in the **`data-views`** domain until normalized **`entities`** replaces raw list payloads.

4. **Playback / queue**: **`playback`** and **`queue`** slices expose `SYNC_*_BRIDGE` actions. Mobile subscribes to `player-queue-store` and RNTP `PlaybackProgressUpdated` in `apps/mobile/engine/state/use-playback-bridge.ts` (mounted once under `TroottStateProvider`). RNTP-coupled stores remain app-local per non-goals.

5. **Uploads (creator)**: **`uploads`** reducer supports `REGISTER_UPLOAD`, `PATCH_UPLOAD`, `COMPLETE_UPLOAD`, `FAIL_UPLOAD` for in-flight ingest maps and recycle-bin ids; dashboards can migrate incrementally.

6. **No zustand inside `@troott/state`**; apps keep platform-local zustand for forms and engine state.

## Consequences

- Apps must wrap the tree with **`TroottStateProvider`** once (web `main.tsx`, mobile root `_layout.tsx`).
- New features should use domain hooks (`useAuthState`, `usePlaybackDispatch`, …) exported from `@troott/state` rather than expanding legacy contexts.
- **`helpers/types.ts`** remains for backward-compatible action constants used by `data-views` and older dispatch paths until fully migrated.
- Follow-up: migrate consumers off `useContextType`, retire duplicate mobile/web stores per product plan, then remove `LegacyCompatContexts` when safe.

## Backend alignment

Domain names mirror apps/api modules as described in the product plan (auth, profile, preference, library, playback, billing, invitations, share links, etc.). Normalized entity shapes will align with DTOs from `@troott/api-client`.
