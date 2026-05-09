# LegacyCompatContexts

File: `packages/state/src/compat/LegacyCompatContexts.tsx`.

This component runs **inside** `UiProvider` (see [troott-state-provider.md](./troott-state-provider.md)). It calls domain hooks (`useAuthState`, `useProfileState`, …) and builds:

1. One object matching `IUserContext`.
2. One object matching `IAppContext`.

Then it renders:

```tsx
<UserContext.Provider value={userContext}>
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
</UserContext.Provider>
```

Imports for contexts: `../user/userContext`, `../app/appContext`.

## IUserContext field sources

| IUserContext field | Domain state / dispatch |
|-------------------|-------------------------|
| `users` | `useDataViewsState().users` |
| `user` | `useAuthState().user` |
| `userType` | `useAuthState().userType` |
| `profile` | `useProfileState().profile` |
| `preferences` | `useProfileState().preferences` |
| `permissions` | `useAuthState().permissions` |
| `subscription` | `useSubscriptionState().subscription` |
| `plan` | `useSubscriptionState().plan` |
| `loading` | `useUiState().loading` |
| `toast` | `useUiState().toast` |
| `sidebar` | `useUiState().sidebar` |
| `setUser` | `useAuthDispatch()` → `SET_USER` (`helpers/types.ts`) |
| `setUserType` | `useAuthDispatch()` → `SET_USER_TYPE` |
| `setProfile` | `useProfileDispatch()` → `SET_PROFILE` |
| `setPreferences` | `useProfileDispatch()` → `SET_PREFERENCES` |
| `setPermissions` | `useAuthDispatch()` → `SET_PERMISSIONS` |
| `setSubscription` | `useSubscriptionDispatch()` → `SET_SUBSCRIPTION` |
| `setPlan` | `useSubscriptionDispatch()` → `SET_PLAN` |
| `setToast` | `useUiDispatch()` → `SET_TOAST` |
| `clearToast` | `useUiDispatch()` → `SET_TOAST` (cleared payload) |
| `setSidebar` | `useUiDispatch()` → `SET_SIDEBAR` |
| `setCollection` | `useDataViewsDispatch()`, `type` + payload from [types.md](./types.md) |
| `setResource` | `useDataViewsDispatch()`, `type` + payload |
| `setLoading` (user) | `useUiDispatch()` → `SET_LOADING` if `option === 'default'`; else `useDataViewsDispatch` with `type` and `collection` seed + `loading: true` |
| `unsetLoading` (user) | `useUiDispatch()` → `UNSET_LOADING` if `option === 'default'`; else `useDataViewsDispatch` with `type` and `collection` + `loading: false` |
| `refreshProfile` | `troottAPIClient().profile.getMe()` → `useProfileDispatch()` with `GET_PROFILE` |

## IAppContext data field sources

| IAppContext field | Domain state |
|------------------|--------------|
| `sermons` | `useDataViewsState().sermons` |
| `sermon` | `useDataViewsState().sermon` |
| `playlists` | `useDataViewsState().playlists` |
| `playlist` | `useDataViewsState().playlist` |
| `ministers` | `useDataViewsState().ministers` |
| `minister` | `useDataViewsState().minister` |
| `listeners` | `useDataViewsState().listeners` |
| `listener` | `useDataViewsState().listener` |
| `creators` | `useDataViewsState().creators` |
| `creator` | `useDataViewsState().creator` |
| `library` | `useDataViewsState().library` |
| `discoveryHome` | `useDataViewsState().discoveryHome` |
| `featuredMinister` | `useDataViewsState().featuredMinister` |
| `searchResults` | `useDataViewsState().searchResults` |
| `plans` | `useDataViewsState().plans` |
| `plan` | `useDataViewsState().plan` |
| `transactions` | `useDataViewsState().transactions` |
| `transaction` | `useDataViewsState().transaction` |
| `loading` | `useDataViewsState().loading` |

## IAppContext methods

| IAppContext method | Source |
|--------------------|--------|
| `setCollection` | `useDataViewsDispatch()` (shared with `IUserContext.setCollection`) |
| `setResource` | `useDataViewsDispatch()` |
| `setLoading` | `useDataViewsDispatch()` → `SET_LOADING` or per-`type` with `collection` seed |
| `unsetLoading` | `useDataViewsDispatch()` → `UNSET_LOADING` or per-`type` |
| `loadDiscoveryHome` | `troottAPIClient().discovery.getHome()` → `GET_DISCOVERY_HOME` |

This file wires domain hooks to `UserContext` and `AppContext`; it does not add types beyond `IUserContext` / `IAppContext`.
