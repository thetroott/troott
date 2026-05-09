# TroottStateProvider

File: `packages/state/src/TroottStateProvider.tsx`.

Single composition root. Innermost child before the app tree is `LegacyCompatContexts`, which supplies `UserContext` and `AppContext` values.

Imports (explicit):

- `./domains/auth/auth.context` → `AuthProvider`
- `./domains/experiments/experiments.context` → `ExperimentsProvider`
- `./domains/preferences/preferences.context` → `PreferencesProvider`
- `./domains/onboarding/onboarding.context` → `OnboardingProvider`
- `./domains/profile/profile.context` → `ProfileProvider`
- `./domains/entities/entities.context` → `EntitiesProvider`
- `./domains/data-views/data-views.context` → `DataViewsProvider`
- `./domains/playback/playback.context` → `PlaybackProvider`
- `./domains/queue/queue.context` → `QueueProvider`
- `./domains/library/library.context` → `LibraryProvider`
- `./domains/downloads/downloads.context` → `DownloadsProvider`
- `./domains/recommendations/recommendations.context` → `RecommendationsProvider`
- `./domains/search/search.context` → `SearchProvider`
- `./domains/social/social.context` → `SocialProvider`
- `./domains/notifications/notifications.context` → `NotificationsProvider`
- `./domains/subscription/subscription.context` → `SubscriptionProvider`
- `./domains/billing/billing.context` → `BillingProvider`
- `./domains/devices/devices.context` → `DevicesProvider`
- `./domains/uploads/uploads.context` → `UploadsProvider`
- `./domains/invitations/invitations.context` → `InvitationsProvider`
- `./domains/shares/shares.context` → `SharesProvider`
- `./domains/engagement/engagement.context` → `EngagementProvider`
- `./domains/ui/ui.context` → `UiProvider`
- `./compat/LegacyCompatContexts` → default export

Nesting order (outer → inner):

```
AuthProvider
  ExperimentsProvider
    PreferencesProvider
      OnboardingProvider
        ProfileProvider
          EntitiesProvider
            DataViewsProvider
              PlaybackProvider
                QueueProvider
                  LibraryProvider
                    DownloadsProvider
                      RecommendationsProvider
                        SearchProvider
                          SocialProvider
                            NotificationsProvider
                              SubscriptionProvider
                                BillingProvider
                                  DevicesProvider
                                    UploadsProvider
                                      InvitationsProvider
                                        SharesProvider
                                          EngagementProvider
                                            UiProvider
                                              LegacyCompatContexts
                                                {children}
```

Export: `packages/state/src/index.ts` re-exports `TroottStateProvider`.
