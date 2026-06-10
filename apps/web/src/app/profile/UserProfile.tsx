import * as React from 'react';
import {
    Calendar,
    Headphones,
    MicVocal,
    SquarePen,
    UserRound,
} from 'lucide-react';
import { useProfileQuery } from '@/hooks/app/useProfile';
import { useProfileInsightStats } from '@/hooks/app/useProfileStats';
import { useProfileRecentSermons } from '@/hooks/app/useProfileRecentSermons';
import { useStudio } from '@/context/studio/useStudio';
import {
    formatInsightMetric,
    formatMemberSince,
    formatProfileAudienceLine,
    getDisplayName,
    getInitials,
    profileImageSrc,
} from '@/app/profile/profile-page.util';
import { isMinisterProfile } from './profile.types';
import { EditProfileDialog } from '@/components/features/profile/EditProfileDialog';
import { ProfileDetailsCard } from '@/components/features/profile/ProfileReadSections';
import { ProfileRecentSermons } from '@/components/features/profile/ProfileRecentSermons';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ProfilePageShell({ children }: { children: React.ReactNode }) {
    return (
        <div
            className={cn(
                MY_SERMONS_PAGE.pageBg,
                'flex min-h-0 flex-1 flex-col text-[#eaeaea]',
            )}
        >
            <div className={MY_SERMONS_PAGE.mainColumn}>{children}</div>
        </div>
    );
}

function ProfilePageHeader() {
    return (
        <header className="rounded-xl border border-[#545454] bg-[#2b2a2c] px-6 py-5">
            <h1 className="text-xl font-semibold leading-7 text-[#eaeaea]">
                Profile
            </h1>
            <p className="mt-1 text-sm leading-5 tracking-[0.01em] text-[#bdbdbd]">
                This is how listeners will see you on the platform.
            </p>
        </header>
    );
}

function UserProfile() {
    const { data: profile, isLoading, isError, error, refetch } =
        useProfileQuery();
    const { studioCode } = useStudio();
    const [editOpen, setEditOpen] = React.useState(false);

    const ministerId = profile?.id;
    const { stats, isLoading: statsLoading } =
        useProfileInsightStats(ministerId);
    const recent = useProfileRecentSermons(ministerId);

    if (isLoading) {
        return (
            <ProfilePageShell>
                <div className="space-y-4">
                    <div className="h-[84px] animate-pulse rounded-xl bg-[#333234]" />
                    <div className="h-[368px] animate-pulse rounded-xl bg-[#333234]" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-xl bg-[#333234]"
                            />
                        ))}
                    </div>
                </div>
            </ProfilePageShell>
        );
    }

    if (isError || !profile) {
        return (
            <ProfilePageShell>
                <StudioEmptyState
                    placement="region"
                    className="min-h-[40vh]"
                    description={
                        <span className="text-red-400">
                            {error instanceof Error
                                ? error.message
                                : 'Could not load profile. Please refresh.'}
                        </span>
                    }
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refetch()}
                    >
                        Retry
                    </Button>
                </StudioEmptyState>
            </ProfilePageShell>
        );
    }

    const minister = isMinisterProfile(profile);
    const coverUrl = profileImageSrc(profile.coverImage, {
        v: profile.updatedAt,
    });
    const avatarUrl = profileImageSrc(profile.avatar, {
        v: profile.updatedAt,
    });
    const displayName = getDisplayName(profile);
    const initials = getInitials(profile);
    const handle = profile.slug ? `@${profile.slug}` : null;
    const ministryName = minister ? profile.ministryName : null;

    const audienceLine = formatProfileAudienceLine(
        profile.monthlyListeners,
        stats.followers,
    );

    const metric = (value: number | undefined) =>
        statsLoading ? '\u2014' : formatInsightMetric(value);

    const insightCards = [
        {
            icon: MicVocal,
            label: 'Sermons published',
            value: metric(stats.sermonsPublished),
        },
        {
            icon: Headphones,
            label: 'Total Listens',
            value: metric(stats.totalListens),
        },
        {
            icon: UserRound,
            label: 'Followers',
            value: metric(stats.followers),
        },
        {
            icon: Calendar,
            label: 'Member Since',
            value: formatMemberSince(profile.createdAt),
        },
    ];

    return (
        <ProfilePageShell>
            <div className="space-y-4">
                <ProfilePageHeader />

                <section
                    className="relative overflow-hidden rounded-xl border border-[#545454]"
                    aria-label="Profile cover"
                >
                    <div className="relative h-[368px] w-full">
                        {coverUrl ? (
                            <img
                                src={coverUrl}
                                alt={`${displayName} cover`}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="eager"
                            />
                        ) : (
                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-br from-[#3d3a4f] via-[#2b2a2c] to-[#1c1c1e]"
                            />
                        )}
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
                        />

                        <div className="relative flex h-full flex-col justify-end px-6 pb-6 md:px-8 md:pb-7">
                            <div className="flex items-end justify-between gap-6">
                                <div className="flex items-end gap-5">
                                    <div className="flex h-[127px] w-[127px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#08ffdb] bg-[#4a4a4a]">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={`${displayName} avatar`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-semibold text-[#eaeaea]">
                                                {initials}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 pb-1">
                                        <h2 className="truncate text-[28px] font-semibold leading-[34px] text-white drop-shadow">
                                            {displayName}
                                        </h2>
                                        {handle ? (
                                            <p className="mt-0.5 text-sm leading-5 text-[#e8e8e8]/85 drop-shadow">
                                                {handle}
                                            </p>
                                        ) : null}
                                        {ministryName ? (
                                            <p className="mt-1 text-sm leading-5 text-[#e8e8e8]/85 drop-shadow">
                                                {ministryName}
                                            </p>
                                        ) : null}
                                        {audienceLine ? (
                                            <p className="mt-1 text-sm leading-5 text-[#e8e8e8]/75 drop-shadow">
                                                {audienceLine}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditOpen(true)}
                                    className="inline-flex h-9 shrink-0 items-center gap-2 self-end rounded-sm border border-[#707070] bg-transparent px-4 text-sm font-medium text-[#eaeaea] shadow-none hover:bg-white/10"
                                    aria-label="Edit profile"
                                >
                                    <SquarePen className="h-4 w-4" />
                                    Edit profile
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {insightCards.map(({ icon: Icon, label, value }) => (
                        <article
                            key={label}
                            className="rounded-xl border border-[#545454] bg-[#2b2a2c] px-4 py-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a393b]">
                                    <Icon className="h-5 w-5 text-[#eaeaea]" />
                                </div>
                                <div>
                                    <p className="text-sm leading-5 tracking-[0.01em] text-[#bdbdbd]">
                                        {label}
                                    </p>
                                    <p className="text-[28px] font-medium leading-[30px]">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
                    <ProfileDetailsCard
                        profile={profile}
                        onEdit={() => setEditOpen(true)}
                    />
                    <ProfileRecentSermons
                        rows={recent.rows}
                        isLoading={recent.isLoading}
                        studioCode={studioCode}
                    />
                </section>

                <EditProfileDialog
                    profile={profile}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            </div>
        </ProfilePageShell>
    );
}

export default UserProfile;
