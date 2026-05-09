# Performance knobs (shared client / apps)

Must-haves landed in code:

- HTTP: `AxiosService` uses configurable timeout (default 30s), GET retry on 502/504 with backoff, in-flight GET dedupe, optional circuit breaker after repeated 5xx, conditional GET ETag cache bucket.
- TanStack Query: `TroottQueryProvider` defaults staleTime 5m, gcTime 30m, `refetchOnWindowFocus` false.
- State: `useAppSelector` / `useUserSelector` for narrower subscriptions.

Follow-ups (track in issues):

- persistQueryClient allow-list wired per app with MMKV/web drivers.
- Network-aware prefetch / mutation idempotency header wiring end-to-end.
- Lazy resource getters on `TroottAPIClient` for bundle size.

Environment variables should be read at SDK construction per app (document in each app README).
