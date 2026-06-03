import * as React from 'react';
import {
    Building2,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatProfilePhone,
} from '@/app/profile/profile-format.util';
import {
    isMinisterProfile,
    type MinisterProfile,
    type ProfileDTO,
} from '@/app/profile/profile.types';

const sectionHeading =
    'text-[28px] font-semibold leading-[30px] text-[#eaeaea]';
const bodyText =
    'text-base leading-6 tracking-[0.01em] text-[#bdbdbd]';
const rowLabel = 'text-sm leading-5 text-[#bdbdbd]';
const rowValue = 'text-base leading-6 tracking-[0.01em] text-[#eaeaea]';
const divider = 'my-6 border-t border-[#545454]';

function ProfileDetailRow({
    icon: Icon,
    label,
    optional,
    value,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    optional?: boolean;
    value: string | null | undefined;
    href?: string;
}) {
    if (!value?.trim()) {
        return null;
    }
    const content = (
        <span className={rowValue}>{value}</span>
    );
    return (
        <div className="flex gap-3 py-3 first:pt-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3a393b]">
                <Icon className="h-5 w-5 text-[#eaeaea]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
                <p className={rowLabel}>
                    {label}
                    {optional ? (
                        <span className="text-[#9d9d9d]"> · Optional</span>
                    ) : null}
                </p>
                {href ? (
                    <a
                        href={href}
                        className={cn(rowValue, 'hover:underline')}
                    >
                        {value}
                    </a>
                ) : (
                    content
                )}
            </div>
        </div>
    );
}

const SocialIconMap = {
    instagram: (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-[#eaeaea]">
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-[#eaeaea]">
            <path
                d="M18.244 3H21.5l-7.5 8.57L22.5 21h-6.836l-5.36-6.998L4 21H.74l8.018-9.165L0 3h7.012l4.846 6.402L18.244 3Zm-2.4 16.2h1.788L7.27 4.7H5.36l10.484 14.5Z"
                fill="currentColor"
            />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-[#eaeaea]">
            <path
                d="M16.5 3.2c.3 1.6 1.2 3 2.5 3.9 1 .7 2.2 1.1 3.5 1.2v3.4c-1.7-.05-3.3-.5-4.7-1.3v6.5c0 3.6-2.9 6.6-6.6 6.6S5 20.6 5 16.9c0-3.7 3-6.6 6.6-6.6.3 0 .6 0 .9.05v3.5c-.3-.1-.6-.15-.9-.15a3.2 3.2 0 1 0 3.2 3.2V3.2h1.7Z"
                fill="currentColor"
            />
        </svg>
    ),
} as const;

function SocialDetailRow({
    network,
    label,
    value,
}: {
    network: keyof typeof SocialIconMap;
    label: string;
    value?: string;
}) {
    if (!value?.trim()) {
        return null;
    }
    return (
        <div className="flex gap-3 py-3 first:pt-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3a393b]">
                {SocialIconMap[network]}
            </div>
            <div className="min-w-0 flex-1">
                <p className={rowLabel}>
                    {label}
                    <span className="text-[#9d9d9d]"> · Optional</span>
                </p>
                <p className={rowValue}>{value}</p>
            </div>
        </div>
    );
}

interface ProfileDetailsCardProps {
    profile: ProfileDTO;
    onEdit: () => void;
}

/** Left column: About + minister Contact / Ministry / Social (Figma `11578:98647`). */
export function ProfileDetailsCard({ profile, onEdit }: ProfileDetailsCardProps) {
    const minister = isMinisterProfile(profile);
    const contactEmail =
        (minister && profile.profileEmail) || profile.email || null;
    const phone = formatProfilePhone(
        profile.phoneNumber,
        profile.phoneCode,
        profile.countryPhone,
    );

    const hasContact = Boolean(contactEmail || phone);
    const hasMinistry =
        minister &&
        Boolean(
            (profile as MinisterProfile).ministryName ||
                (profile as MinisterProfile).ministryHQLocation,
        );
    const socials = minister ? profile.socials : undefined;
    const hasSocial = Boolean(
        socials?.instagram || socials?.twitter || socials?.tiktok,
    );

    return (
        <article className="rounded-xl border border-[#545454] bg-[#2b2a2c] p-6">
            <h3 className={sectionHeading}>About</h3>
            {profile.bio ? (
                <div className={cn(bodyText, 'mt-5 whitespace-pre-line')}>
                    {profile.bio}
                </div>
            ) : (
                <p className="mt-5 text-base leading-6 tracking-[0.01em] text-[#9d9d9d]">
                    Tell listeners about yourself. Click
                    <button
                        type="button"
                        onClick={onEdit}
                        className="ml-1 font-medium text-[#eaeaea] underline-offset-2 hover:underline"
                    >
                        Edit profile
                    </button>
                    <span> to add a bio.</span>
                </p>
            )}

            {minister && hasContact ? (
                <>
                    <hr className={divider} aria-hidden />
                    <h3 className={sectionHeading}>Contact</h3>
                    <div className="mt-2">
                        <ProfileDetailRow
                            icon={Mail}
                            label="Email"
                            value={contactEmail}
                            href={
                                contactEmail
                                    ? `mailto:${contactEmail}`
                                    : undefined
                            }
                        />
                        <ProfileDetailRow
                            icon={Phone}
                            label="Phone"
                            optional
                            value={phone}
                        />
                    </div>
                </>
            ) : null}

            {minister && hasMinistry ? (
                <>
                    <hr className={divider} aria-hidden />
                    <h3 className={sectionHeading}>Ministry Details</h3>
                    <div className="mt-2">
                        <ProfileDetailRow
                            icon={Building2}
                            label="Church"
                            value={(profile as MinisterProfile).ministryName}
                        />
                        <ProfileDetailRow
                            icon={MapPin}
                            label="Location"
                            value={
                                (profile as MinisterProfile).ministryHQLocation
                            }
                        />
                    </div>
                </>
            ) : null}

            {minister && hasSocial ? (
                <>
                    <hr className={divider} aria-hidden />
                    <h3 className={sectionHeading}>Social Networks</h3>
                    <div className="mt-2">
                        <SocialDetailRow
                            network="instagram"
                            label="Instagram"
                            value={socials?.instagram}
                        />
                        <SocialDetailRow
                            network="twitter"
                            label="Twitter"
                            value={socials?.twitter}
                        />
                        <SocialDetailRow
                            network="tiktok"
                            label="TikTok"
                            value={socials?.tiktok}
                        />
                    </div>
                </>
            ) : null}
        </article>
    );
}
