import * as React from 'react';
import {
    Calendar,
    Headphones,
    MicVocal,
    SquarePen,
    UserRound,
} from 'lucide-react';
import { useProfileQuery } from '@/hooks/profile';
import {
    isMinisterProfile,
    type ProfileDTO,
} from './profile.types';
import { resolveAssetUrl } from '@/utils/asset-url.util';
import { EditProfileDialog } from '@/components/features/profile/EditProfileDialog';

const recentSermonsPlaceholder = [
    {
        title: 'Walking in Divine Favour',
        meta: 'Apr 14, 2026 \u2022 2,340 plays',
    },
    {
        title: 'The Power of a Praying Father',
        meta: 'Apr 07, 2026 \u2022 1,905 plays',
    },
    {
        title: 'Faith Over Fear',
        meta: 'Mar 31, 2026 \u2022 3,102 plays',
    },
];

function formatMemberSince(iso: string): string {
    if (!iso) return '\u2014';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function getInitials(profile: ProfileDTO): string {
    const a = profile.firstName?.[0] ?? '';
    const b = profile.lastName?.[0] ?? '';
    return (a + b).toUpperCase() || '?';
}

function getDisplayName(profile: ProfileDTO): string {
    if (isMinisterProfile(profile) && profile.ministerialName) {
        return profile.ministerialName;
    }
    const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return full || profile.email || 'Your name';
}

function UserProfile() {
    const { data: profile, isLoading, isError } = useProfileQuery();
    const [editOpen, setEditOpen] = React.useState(false);

    if (isLoading || !profile) {
        return (
            <div className="mx-auto w-full max-w-[1200px] space-y-4 text-[#eaeaea]">
                <header className="rounded-xl border border-[#545454] bg-[#2b2a2c] px-4 py-3 md:px-6 md:py-4">
                    <h1 className="text-xl font-semibold leading-[30px]">
                        Profile
                    </h1>
                    <p className="text-xs font-medium leading-[18px] tracking-[0.02em] text-[#eaeaea]">
                        This is how listeners will see you on the platform.
                    </p>
                </header>
                <div className="h-[368px] animate-pulse rounded-xl bg-[#2b2a2c]" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-xl bg-[#2b2a2c]"
                        />
                    ))}
                </div>
                {isError ? (
                    <p className="text-sm text-red-400">
                        Could not load profile. Please refresh.
                    </p>
                ) : null}
            </div>
        );
    }

    const minister = isMinisterProfile(profile);
    const coverUrl = resolveAssetUrl(profile.coverImage, {
        v: profile.updatedAt,
    });
    const avatarUrl = resolveAssetUrl(profile.avatar, {
        v: profile.updatedAt,
    });
    const displayName = getDisplayName(profile);
    const initials = getInitials(profile);
    const handle = profile.slug ? `@${profile.slug}` : null;
    const ministryName = minister ? profile.ministryName : null;

    const insightCards = [
        {
            icon: MicVocal,
            label: 'Sermons published',
            value: '\u2014',
        },
        {
            icon: Headphones,
            label: 'Total Listens',
            value: '\u2014',
        },
        {
            icon: UserRound,
            label: 'Followers',
            value: '\u2014',
        },
        {
            icon: Calendar,
            label: 'Member Since',
            value: formatMemberSince(profile.createdAt),
        },
    ];

    return (
        <div className="mx-auto w-full max-w-[1200px] space-y-4 text-[#eaeaea]">
            <header className="rounded-xl border border-[#545454] bg-[#2b2a2c] px-4 py-3 md:px-6 md:py-4">
                <h1 className="text-xl font-semibold leading-[30px]">
                    Profile
                </h1>
                <p className="text-xs font-medium leading-[18px] tracking-[0.02em] text-[#eaeaea]">
                    This is how listeners will see you on the platform.
                </p>
            </header>

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
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="inline-flex h-9 shrink-0 items-center gap-2 self-end rounded-lg bg-white px-4 text-sm font-medium text-[#292929] shadow hover:bg-white/95"
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
                <article className="rounded-xl border border-[#545454] bg-[#2b2a2c] p-6">
                    <h3 className="text-[28px] font-semibold leading-[30px]">
                        About
                    </h3>
                    {profile.bio ? (
                        <div className="mt-5 whitespace-pre-line text-base leading-6 tracking-[0.01em] text-[#bdbdbd]">
                            {profile.bio}
                        </div>
                    ) : (
                        <p className="mt-5 text-base leading-6 tracking-[0.01em] text-[#9d9d9d]">
                            Tell listeners about yourself. Click
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="ml-1 font-medium text-[#eaeaea] underline-offset-2 hover:underline"
                            >
                                Edit profile
                            </button>
                            <span> to add a bio.</span>
                        </p>
                    )}
                </article>

                <article className="rounded-xl border border-[#545454] bg-[#2b2a2c] p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-[28px] font-semibold leading-[30px]">
                            Recent Sermons
                        </h3>
                        <button
                            type="button"
                            className="text-base leading-6 tracking-[0.01em] text-[#eaeaea] hover:underline"
                        >
                            See all
                        </button>
                    </div>
                    <div className="space-y-8">
                        {recentSermonsPlaceholder.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-4"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#545454]">
                                    <MicVocal className="h-5 w-5 text-[#eaeaea]" />
                                </div>
                                <div>
                                    <p className="text-base leading-6 tracking-[0.01em] text-[#eaeaea]">
                                        {item.title}
                                    </p>
                                    <p className="text-sm leading-5 tracking-[0.01em] text-[#bdbdbd]">
                                        {item.meta}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <EditProfileDialog
                profile={profile}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </div>
    );
}

export default UserProfile;
