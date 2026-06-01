# feat-0003: Tech Spec — Tab shell and navigation

## Context

See [`PRODUCT.md`](./PRODUCT.md).

### Layout anchors

| Concern | Path |
| ------- | ---- |
| Root layout | `app/_layout.tsx` — providers, RNTP setup, mini-player, share, network init |
| Tabs | `app/(tabs)/_layout.tsx` — `TabBar`, `useOnboardingGuard`, embedded `FullPlayerInTabs` |
| Tab bar UI | `components/features/navigation/tabbar.tsx` |
| Now-playing focus | `api/hooks/player/now-playing-route.ts` |
| Deep link bootstrap | `lib/deep-link/use-pending-deeplink-bootstrap.ts` |
| Providers | `context/providers.tsx` |

### Stacks (examples)

| Area | Path |
| ---- | ---- |
| Home | `app/(tabs)/home/_layout.tsx`, `index.tsx` |
| Search | `app/(tabs)/search/_layout.tsx`, `query.tsx` |
| Library | `app/(tabs)/library/_layout.tsx` |
| Profile | `app/(tabs)/profile/_layout.tsx` |
| Player modal | `app/player/_layout.tsx`, `index.tsx` |
| Sermon | `app/sermon/[id].tsx` |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–2 | `(tabs)/_layout.tsx` screen order |
| 3 | `_layout.tsx` `shouldHideMiniPlayer` pathname list |
| 4 | `(tabs)/_layout.tsx` `!nowPlayingModalFocused` guard |
| 5 | `_layout.tsx` `startPlayerService`, `PersistQueryClientProvider`, `useShareFlow` |
| 6–7 | Expo Router stacks per tab |
| 8 | `components/features/shared/network-watcehr.tsx`, `lib/state/network-store.ts` |
| 9 | `SplashScreen`, `CustomSplashScreen`, `playerIsReady` state |
