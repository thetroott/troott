import type { ReactNode } from 'react';
import { AuthProvider } from './domains/auth/auth.context';
import { BillingProvider } from './domains/billing/billing.context';
import { DataViewsProvider } from './domains/data-views/data-views.context';
import { DevicesProvider } from './domains/devices/devices.context';
import { DownloadsProvider } from './domains/downloads/downloads.context';
import { EngagementProvider } from './domains/engagement/engagement.context';
import { EntitiesProvider } from './domains/entities/entities.context';
import { ExperimentsProvider } from './domains/experiments/experiments.context';
import { InvitationsProvider } from './domains/invitations/invitations.context';
import { LibraryProvider } from './domains/library/library.context';
import { NotificationsProvider } from './domains/notifications/notifications.context';
import { OnboardingProvider } from './domains/onboarding/onboarding.context';
import { PlaybackProvider } from './domains/playback/playback.context';
import { PreferencesProvider } from './domains/preferences/preferences.context';
import { ProfileProvider } from './domains/profile/profile.context';
import { QueueProvider } from './domains/queue/queue.context';
import { RecommendationsProvider } from './domains/recommendations/recommendations.context';
import { SearchProvider } from './domains/search/search.context';
import { SharesProvider } from './domains/shares/shares.context';
import { SocialProvider } from './domains/social/social.context';
import { SubscriptionProvider } from './domains/subscription/subscription.context';
import { UploadsProvider } from './domains/uploads/uploads.context';
import { UiProvider } from './domains/ui/ui.context';
import LegacyCompatContexts from './compat/LegacyCompatContexts';

/**
 * Composes all domain providers (auth through UI) and legacy User/App context
 * compatibility for existing `useContextType` / selector hooks.
 */
export function TroottStateProvider({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ExperimentsProvider>
                <PreferencesProvider>
                    <OnboardingProvider>
                        <ProfileProvider>
                            <EntitiesProvider>
                                <DataViewsProvider>
                                    <PlaybackProvider>
                                        <QueueProvider>
                                            <LibraryProvider>
                                                <DownloadsProvider>
                                                    <RecommendationsProvider>
                                                        <SearchProvider>
                                                            <SocialProvider>
                                                                <NotificationsProvider>
                                                                    <SubscriptionProvider>
                                                                        <BillingProvider>
                                                                            <DevicesProvider>
                                                                                <UploadsProvider>
                                                                                    <InvitationsProvider>
                                                                                        <SharesProvider>
                                                                                            <EngagementProvider>
                                                                                                <UiProvider>
                                                                                                    <LegacyCompatContexts>
                                                                                                        {
                                                                                                            children
                                                                                                        }
                                                                                                    </LegacyCompatContexts>
                                                                                                </UiProvider>
                                                                                            </EngagementProvider>
                                                                                        </SharesProvider>
                                                                                    </InvitationsProvider>
                                                                                </UploadsProvider>
                                                                            </DevicesProvider>
                                                                        </BillingProvider>
                                                                    </SubscriptionProvider>
                                                                </NotificationsProvider>
                                                            </SocialProvider>
                                                        </SearchProvider>
                                                    </RecommendationsProvider>
                                                </DownloadsProvider>
                                            </LibraryProvider>
                                        </QueueProvider>
                                    </PlaybackProvider>
                                </DataViewsProvider>
                            </EntitiesProvider>
                        </ProfileProvider>
                    </OnboardingProvider>
                </PreferencesProvider>
            </ExperimentsProvider>
        </AuthProvider>
    );
}
