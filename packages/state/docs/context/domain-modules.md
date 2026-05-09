# Domain modules (`src/domains/`)

Each domain is its own folder. Typical files (when present):

- `<name>.types.ts` — state shape + action union.
- `<name>.seed.ts` — initial state.
- `<name>.reducer.ts` — `useReducer` reducer.
- `<name>.context.tsx` — `Provider`, `useXxxState`, `useXxxDispatch`.

**Exception:** `auth` uses `AuthProvider`, `useAuthState`, `useAuthDispatch` implemented directly in `packages/state/src/domains/auth/auth.context.tsx` (not `createDomain`).

**Implementation detail:** Domains other than `auth` use `packages/state/src/domains/_shared/createDomain.tsx` to split React Context into state vs dispatch. Product docs name only the hooks exported from each `*.context.tsx`.

File: `packages/state/src/domains/<folder>/<folder>.context.tsx`.

| Folder | Exports |
|--------|---------|
| `auth` | `AuthProvider`, `useAuthState`, `useAuthDispatch` |
| `billing` | `BillingProvider`, `useBillingState`, `useBillingDispatch` |
| `data-views` | `DataViewsProvider`, `useDataViewsState`, `useDataViewsDispatch` |
| `devices` | `DevicesProvider`, `useDevicesState`, `useDevicesDispatch` |
| `downloads` | `DownloadsProvider`, `useDownloadsState`, `useDownloadsDispatch` |
| `engagement` | `EngagementProvider`, `useEngagementState`, `useEngagementDispatch` |
| `entities` | `EntitiesProvider`, `useEntitiesState`, `useEntitiesDispatch` |
| `experiments` | `ExperimentsProvider`, `useExperimentsState`, `useExperimentsDispatch` |
| `invitations` | `InvitationsProvider`, `useInvitationsState`, `useInvitationsDispatch` |
| `library` | `LibraryProvider`, `useLibraryState`, `useLibraryDispatch` |
| `notifications` | `NotificationsProvider`, `useNotificationsState`, `useNotificationsDispatch` |
| `onboarding` | `OnboardingProvider`, `useOnboardingState`, `useOnboardingDispatch` |
| `playback` | `PlaybackProvider`, `usePlaybackState`, `usePlaybackDispatch` |
| `preferences` | `PreferencesProvider`, `usePreferencesState`, `usePreferencesDispatch` |
| `profile` | `ProfileProvider`, `useProfileState`, `useProfileDispatch` |
| `queue` | `QueueProvider`, `useQueueState`, `useQueueDispatch` |
| `recommendations` | `RecommendationsProvider`, `useRecommendationsState`, `useRecommendationsDispatch` |
| `search` | `SearchProvider`, `useSearchState`, `useSearchDispatch` |
| `shares` | `SharesProvider`, `useSharesState`, `useSharesDispatch` |
| `social` | `SocialProvider`, `useSocialState`, `useSocialDispatch` |
| `subscription` | `SubscriptionProvider`, `useSubscriptionState`, `useSubscriptionDispatch` |
| `uploads` | `UploadsProvider`, `useUploadsState`, `useUploadsDispatch` |
| `ui` | `UiProvider`, `useUiState`, `useUiDispatch` |

Composition order: [troott-state-provider.md](./troott-state-provider.md).
