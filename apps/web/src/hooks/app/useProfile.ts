import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/config';
import { useMinister } from '@/context/minister/useMinister';
import type { ISocials } from '@/dtos/api-domain';
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
    me: () => ['profile', 'me'] as const,
};

function parseMinisterResponsePayload(
    data: unknown,
): MinisterResponseDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as
        | { minister?: MinisterResponseDTO }
        | MinisterResponseDTO;
    if ('minister' in raw && raw.minister) {
        return raw.minister;
    }
    if ('id' in raw && 'code' in raw) {
        return raw as MinisterResponseDTO;
    }
    return null;
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

function ministerResponseToProfileDTO(m: MinisterResponseDTO): MinisterProfile {
    const prof = m.profile ?? {};
    const hq = prof.ministryHQLocation;
    let ministryHQLocation = '';
    if (hq) {
        ministryHQLocation = [hq.address, hq.city, hq.state]
            .filter((part) => Boolean(part))
            .join(', ');
    }

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

/** Profile UI: always `GET /api/v1/minister`. */
export function useProfileQuery() {
    return useQuery({
        queryKey: profileQueryKeys.me(),
        queryFn: async (): Promise<ProfileDTO> => {
            const res = await api.minister.getMinister();
            if (res.error) {
                throw new Error(res.message || 'Could not load profile');
            }
            const minister = parseMinisterResponsePayload(res.data);
            if (!minister) {
                throw new Error('Could not load profile');
            }
            return ministerResponseToProfileDTO(minister);
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Save profile via `PUT /api/v1/minister`, then refetch. */
export function useUpdateProfileMutation() {
    const qc = useQueryClient();
    const ministerCtx = useMinister();

    return useMutation({
        mutationFn: async (payload: UpdateProfilePayload) => {
            const body = profileUpdateToMinisterPut(payload);
            const putRes = await api.minister.updateMinister(body);
            if (putRes.error) {
                throw new Error(putRes.message || 'Could not save profile');
            }

            const res = await api.minister.getMinister();
            if (res.error) {
                throw new Error(res.message || 'Could not refresh profile');
            }
            const minister = parseMinisterResponsePayload(res.data);
            if (!minister) {
                throw new Error('Could not refresh profile');
            }
            return ministerResponseToProfileDTO(minister);
        },
        onSuccess: async (dto) => {
            qc.setQueryData(profileQueryKeys.me(), dto);
            window.dispatchEvent(
                new Event(ONBOARDING_PROFILE_REFRESH_EVENT),
            );
            await ministerCtx.refresh({ force: true });
        },
    });
}
