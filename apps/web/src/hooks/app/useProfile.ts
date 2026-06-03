import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/config';
import cookieService from '@/api/services/cookies';
import { useCreator } from '@/context/creator/useCreator';
import { useMinister } from '@/context/minister/useMinister';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import {
    parseCreatorResponsePayload,
    parseMinisterResponsePayload,
} from '@/utils/studio-profile-payload.util';
import type { ISocials } from '@/dtos/api-domain';
import type {
    CreatorResponseDTO,
    UpdateCreatorDTO,
} from '@/dtos/creator.dto';
import type {
    MinisterResponseDTO,
    UpdateMinisterDTO,
} from '@/dtos/minister.dto';
import {
    type Asset,
    type MinisterProfile,
    type ProfileDTO,
    type ProfileSocials,
    type UpdateProfilePayload,
    UserType,
} from '@/app/profile/profile.types';
import { ONBOARDING_PROFILE_REFRESH_EVENT } from '@/utils/hub-onboarding.util';

export const profileQueryKeys = {
    me: (role: string) => ['profile', 'me', role] as const,
};

function isCreatorStudioAccount(): boolean {
    return (
        normalizeUserType(cookieService.getUserType() || '') ===
        UserType.CREATOR.toLowerCase()
    );
}

function assetFromApiField(stored: string | null | undefined): Asset | null {
    if (!stored) {
        return null;
    }
    if (stored.startsWith('http://') || stored.startsWith('https://')) {
        return {
            fileName: '',
            s3Key: '',
            url: stored,
        };
    }
    return {
        fileName: stored.split('/').pop() ?? '',
        s3Key: stored,
    };
}

function socialsFromApi(list?: ISocials[]): ProfileSocials | undefined {
    if (!list?.length) {
        return undefined;
    }
    const out: ProfileSocials = {};
    for (const s of list) {
        const n = (s.name || '').toLowerCase();
        const handle = s.username || s.url || '';
        if (!handle) {
            continue;
        }
        if (n.includes('instagram')) {
            out.instagram = handle;
        } else if (n.includes('twitter') || n === 'x') {
            out.twitter = handle;
        } else if (n.includes('tiktok')) {
            out.tiktok = handle;
        }
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

function socialsToApi(socials?: ProfileSocials): ISocials[] | undefined {
    if (!socials) {
        return undefined;
    }
    const out: ISocials[] = [];
    if (socials.instagram?.trim()) {
        out.push({
            name: 'instagram',
            url: '',
            username: socials.instagram.trim(),
        });
    }
    if (socials.twitter?.trim()) {
        out.push({
            name: 'twitter',
            url: '',
            username: socials.twitter.trim(),
        });
    }
    if (socials.tiktok?.trim()) {
        out.push({
            name: 'tiktok',
            url: '',
            username: socials.tiktok.trim(),
        });
    }
    return out.length > 0 ? out : undefined;
}

function contactFieldsFromApi(
    top: { email?: string; phoneNumber?: string; phoneCode?: string; countryPhone?: string },
    nested?: {
        email?: string;
        phoneNumber?: string;
        phoneCode?: string;
        countryPhone?: string;
    },
) {
    const profileEmail = nested?.email?.trim() || undefined;
    const phoneNumber =
        nested?.phoneNumber?.trim() ||
        top.phoneNumber?.trim() ||
        undefined;
    const phoneCode =
        nested?.phoneCode?.trim() || top.phoneCode?.trim() || undefined;
    const countryPhone =
        nested?.countryPhone?.trim() ||
        top.countryPhone?.trim() ||
        undefined;
    return { profileEmail, phoneNumber, phoneCode, countryPhone };
}

function creatorResponseToProfileDTO(c: CreatorResponseDTO): MinisterProfile {
    const prof = c.profile ?? {};
    const contact = contactFieldsFromApi(c, undefined);
    return {
        id: c.id,
        userType: UserType.MINISTER,
        firstName: c.firstName ?? '',
        lastName: c.lastName ?? '',
        email: c.email ?? '',
        slug: c.slug,
        bio: prof.description,
        avatar: assetFromApiField(c.avatar),
        coverImage: assetFromApiField(c.banner),
        ministerialName: prof.displayName,
        ministryName: prof.displayName,
        ministryWebsite: prof.websiteUrl,
        socials: socialsFromApi(prof.socials),
        phoneNumber: contact.phoneNumber,
        phoneCode: contact.phoneCode,
        countryPhone: contact.countryPhone,
        monthlyListeners: c.monthlyListeners,
        createdAt: c.createdAt ?? new Date().toISOString(),
        updatedAt: c.updatedAt ?? new Date().toISOString(),
    };
}

function ministerResponseToProfileDTO(m: MinisterResponseDTO): MinisterProfile {
    const prof = m.profile ?? {};
    const hq = prof.ministryHQLocation;
    let ministryHQLocation = '';
    if (hq) {
        ministryHQLocation = [hq.address, hq.city, hq.state]
            .filter((part) => Boolean(part))
            .join(', ');
    }
    const contact = contactFieldsFromApi(m, prof);

    return {
        id: m.id,
        userType: UserType.MINISTER,
        firstName: m.firstName ?? '',
        lastName: m.lastName ?? '',
        email: m.email ?? '',
        slug: m.slug,
        bio: prof.description,
        avatar: assetFromApiField(m.avatar),
        coverImage: assetFromApiField(m.banner),
        ministerialName: prof.ministerialName,
        ministryName: prof.ministryName,
        ministryHQLocation: ministryHQLocation || undefined,
        ministryWebsite: prof.websiteUrl,
        socials: socialsFromApi(prof.socials),
        profileEmail: contact.profileEmail,
        phoneNumber: contact.phoneNumber,
        phoneCode: contact.phoneCode,
        countryPhone: contact.countryPhone,
        monthlyListeners: m.monthlyListeners,
        createdAt: m.createdAt ?? new Date().toISOString(),
        updatedAt: m.updatedAt ?? new Date().toISOString(),
    };
}

function assetToPutValue(asset: Asset | null | undefined): string | undefined {
    if (asset === null) {
        return '';
    }
    if (!asset?.s3Key) {
        return undefined;
    }
    return asset.s3Key;
}

function profileUpdateToMinisterPut(
    payload: UpdateProfilePayload,
): UpdateMinisterDTO {
    const body: UpdateMinisterDTO = {};

    if (payload.bio !== undefined) {
        body.profile = { ...(body.profile ?? {}), description: payload.bio };
    }

    if (payload.avatar !== undefined) {
        body.avatar = assetToPutValue(payload.avatar);
    }
    if (payload.coverImage !== undefined) {
        body.banner = assetToPutValue(payload.coverImage);
    }

    if (payload.ministry) {
        const m = payload.ministry;
        const profile = body.profile ?? {};
        if (m.ministerialName !== undefined) {
            profile.ministerialName = m.ministerialName;
        }
        if (m.ministryName !== undefined) {
            profile.ministryName = m.ministryName;
        }
        if (m.ministryWebsite !== undefined) {
            profile.websiteUrl = m.ministryWebsite;
        }
        if (m.ministryHQLocation !== undefined) {
            profile.ministryHQLocation = {
                address: m.ministryHQLocation,
            };
        }
        const apiSocials = socialsToApi(m.socials);
        if (apiSocials !== undefined) {
            profile.socials = apiSocials;
        }
        body.profile = profile;
    }

    return body;
}

function profileUpdateToCreatorPut(
    payload: UpdateProfilePayload,
): UpdateCreatorDTO {
    const body: UpdateCreatorDTO = {};

    if (payload.bio !== undefined) {
        body.profile = { ...(body.profile ?? {}), description: payload.bio };
    }
    if (payload.avatar !== undefined) {
        body.avatar = assetToPutValue(payload.avatar);
    }
    if (payload.coverImage !== undefined) {
        body.banner = assetToPutValue(payload.coverImage);
    }

    if (payload.ministry) {
        const m = payload.ministry;
        const profile = body.profile ?? {};
        if (m.ministerialName !== undefined) {
            profile.displayName = m.ministerialName;
        }
        if (m.ministryWebsite !== undefined) {
            profile.websiteUrl = m.ministryWebsite;
        }
        const apiSocials = socialsToApi(m.socials);
        if (apiSocials !== undefined) {
            profile.socials = apiSocials;
        }
        body.profile = profile;
    }

    return body;
}

async function fetchProfileDto(): Promise<ProfileDTO> {
    const creatorAccount = isCreatorStudioAccount();

    if (creatorAccount) {
        const res = await api.creator.getCreator();
        if (res.error) {
            throw new Error(res.message || 'Could not load profile');
        }
        const creator = parseCreatorResponsePayload(res.data);
        if (!creator) {
            throw new Error('Could not load profile');
        }
        return creatorResponseToProfileDTO(creator);
    }

    const res = await api.minister.getMinister();
    if (res.error) {
        throw new Error(res.message || 'Could not load profile');
    }
    const minister = parseMinisterResponsePayload(res.data);
    if (!minister) {
        throw new Error('Could not load profile');
    }
    return ministerResponseToProfileDTO(minister);
}

/** Profile UI: `GET /api/v1/minister` or `GET /api/v1/creator` by account type. */
export function useProfileQuery() {
    const role = isCreatorStudioAccount() ? 'creator' : 'minister';
    return useQuery({
        queryKey: profileQueryKeys.me(role),
        queryFn: fetchProfileDto,
        staleTime: 5 * 60 * 1000,
    });
}

/** Save profile via minister or creator `PUT`, then refetch. */
export function useUpdateProfileMutation() {
    const qc = useQueryClient();
    const ministerCtx = useMinister();
    const creatorCtx = useCreator();
    const creatorAccount = isCreatorStudioAccount();

    return useMutation({
        mutationFn: async (payload: UpdateProfilePayload) => {
            if (creatorAccount) {
                const putRes = await api.creator.updateCreator(
                    profileUpdateToCreatorPut(payload),
                );
                if (putRes.error) {
                    throw new Error(putRes.message || 'Could not save profile');
                }
            } else {
                const putRes = await api.minister.updateMinister(
                    profileUpdateToMinisterPut(payload),
                );
                if (putRes.error) {
                    throw new Error(putRes.message || 'Could not save profile');
                }
            }
            return fetchProfileDto();
        },
        onSuccess: async (dto) => {
            const role = creatorAccount ? 'creator' : 'minister';
            qc.setQueryData(profileQueryKeys.me(role), dto);
            window.dispatchEvent(
                new Event(ONBOARDING_PROFILE_REFRESH_EVENT),
            );
            if (creatorAccount) {
                await creatorCtx.refresh({ force: true });
            } else {
                await ministerCtx.refresh({ force: true });
            }
        },
    });
}
