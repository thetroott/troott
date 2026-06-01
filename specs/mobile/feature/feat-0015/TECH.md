# feat-0015: Tech Spec — Server playback progress

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API contract

| Method | Path | Body / params |
| ------ | ---- | ------------- |
| POST | `/api/v1/playback` | `{ sermonId, positionSeconds, durationSeconds? }` |
| GET | `/api/v1/playback` | List user progress (recent) |
| GET | `/api/v1/playback/sermon/:sermonId` | Single sermon progress |

Auth: **`Protect`**. Controller: `apps/api/src/controllers/core/playback.controller.ts`.

## Listening history API (required — API work)

Service today: `listenerService.addToListeningHistory` — **not exposed on router**.

| Method | Path (recommended) | Purpose |
| ------ | ------------------ | ------- |
| GET | `/api/v1/listener/listening-history` | Paginated sermon cards (populate `listeningHistory` refs) |
| POST | `/api/v1/listener/listening-history` | Body `{ sermonId }` — append on listen threshold |

Alternative: extend `GET /listener` response with populated `listeningHistory` (heavier payload; prefer dedicated list for Library).

Mobile hooks to add (P1):

| Hook | File |
| ---- | ---- |
| `useListeningHistoryQuery` | `api/hooks/app/useListener.ts` |
| `useRecordListeningHistoryMutation` | same — call from playback bridge after threshold |

Wire from `engine/state/use-playback-bridge.ts` when position crosses threshold; **do not** duplicate on every progress tick.

## Existing mobile hooks

| Hook | File | Status |
| ---- | ---- | ------ |
| `useSavePlaybackProgressMutation` | `api/hooks/app/usePlayback.ts` | Wire |
| `usePlaybackForSermonQuery` | same | Wire |
| (new) `useRecentPlaybackQuery` | add wrapper on `listPlaybackProgress` | Add |

## Save triggers

| Event | Location |
| ----- | -------- |
| Pause | `use-playback-controls.ts` / RNTP listener |
| Track change (leave sermon) | `engine/state/use-playback-bridge.ts` or foreground listener |
| Interval while playing | Debounced in bridge (30–60s) |
| App background | `AppState` in `_layout.tsx` (**P1** — flush debounced save) |

Implementation sketch:

```ts
// engine/playback/use-sync-playback-progress.ts
export function useSyncPlaybackProgress() {
  const save = useSavePlaybackProgressMutation();
  return useDebouncedCallback((sermonId, positionSec, durationSec) => {
    save.mutate({ sermonId, positionSeconds: positionSec, durationSeconds: durationSec });
  }, 30_000);
}
```

## Hydrate continue listening

File: `components/features/home/continue-listening-section.tsx`

1. `useRecentPlaybackQuery()` → pick latest row.
2. Map to `SermonItemDTO` via sermon id fetch or embedded sermon in playback DTO.
3. Merge with `useLastPlayed()` — prefer newer `updatedAt`.

File: `engine/playback/use-resume-last-played.ts` — apply server position on `play()`.

## Query keys

Add to `api/query-keys.ts`:

```ts
playback: {
  recent: () => ['playback', 'recent'],
  sermon: (id: string) => ['playback', 'sermon', id],
}
```

## Client fix

`PlaybackService.getPlaybackForSermon` — ensure mobile client uses **`isAuth: true`** (sermon client incorrectly uses `false` for some routes; playback already auth).

## Tests

| Test | Type |
| ---- | ---- |
| Debounce coalesces saves | Unit |
| Merge local vs server timestamp | Unit |
| Continue section renders from API mock | Component |

## Offline queue (P2)

File: `apps/mobile/api/services/pending-playback-sync-mmkv.ts` (new)

- Append `{ sermonId, positionSeconds, durationSeconds, updatedAt }` when `POST /playback` fails (network).
- On `AppState` `active` + online: drain FIFO, delete on success.

## Checklist

- [ ] `useRecentPlaybackQuery`
- [ ] Progress save hook wired to engine events
- [ ] Continue listening + resume use server data
- [ ] **P1:** AppState background flush
- [ ] **P1 (API):** `GET/POST /listener/listening-history` + mobile hooks + Library History
- [ ] **P2:** MMKV pending progress queue
- [ ] Update `02 - continue-listening.md` + feat-0004 TECH gap table
