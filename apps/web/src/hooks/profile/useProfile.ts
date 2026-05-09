import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IAPIResponse } from '@troott/api-client';
import { queryKeys, troottAPIClient } from '@troott/api-client';
import '@/api/clients/troott';
import {
    isMinisterProfile,
    type ProfileDTO,
    type UpdateProfilePayload,
} from '@/app/profile/profile.types';
import { DUMMY_MINISTER_PROFILE } from '@/app/profile/profile.dummy';

function profileUsesRealApi(): boolean {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    return env?.VITE_PROFILE_USE_REAL_API === 'true';
}

function extractProfileDto(res: IAPIResponse<unknown>): ProfileDTO {
    const payload = res.data as Record<string, unknown> | null | undefined;
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: ProfileDTO }).data;
    }
    return payload as unknown as ProfileDTO;
}

function applyMockProfileUpdate(
    prev: ProfileDTO,
    payload: UpdateProfilePayload,
): ProfileDTO {
    let next: ProfileDTO = {
        ...prev,
        updatedAt: new Date().toISOString(),
    };

    if (payload.bio !== undefined) {
        next = { ...next, bio: payload.bio };
    }
    if (payload.avatar !== undefined) {
        next = { ...next, avatar: payload.avatar };
    }
    if (payload.coverImage !== undefined) {
        next = { ...next, coverImage: payload.coverImage };
    }

    if (payload.ministry && isMinisterProfile(next)) {
        const m = payload.ministry;
        next = {
            ...next,
            ...(m.ministerialName !== undefined && {
                ministerialName: m.ministerialName,
            }),
            ...(m.ministryName !== undefined && {
                ministryName: m.ministryName,
            }),
            ...(m.ministryHQLocation !== undefined && {
                ministryHQLocation: m.ministryHQLocation,
            }),
            ...(m.ministryWebsite !== undefined && {
                ministryWebsite: m.ministryWebsite,
            }),
            ...(m.socials !== undefined && {
                socials: {
                    ...next.socials,
                    ...m.socials,
                },
            }),
        };
    }

    return next;
}

/**
 * Read profile: uses static dummy data unless `VITE_PROFILE_USE_REAL_API=true`.
 */
export function useProfileQuery() {
    const live = profileUsesRealApi();
    return useQuery({
        queryKey: [...queryKeys.profile.me, live ? 'live' : 'mock'],
        queryFn: async () => {
            if (!live) {
                return DUMMY_MINISTER_PROFILE;
            }
            const res = await troottAPIClient().profile.getMe();
            if (res.error) {
                throw new Error(
                    (res.message as string | undefined) ?? 'Failed to load profile',
                );
            }
            return extractProfileDto(res);
        },
        staleTime: live ? undefined : Infinity,
    });
}

/**
 * Save profile: merges into React Query cache when using dummy data;
 * otherwise calls `PUT /profile/me`.
 */
export function useUpdateProfileMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateProfilePayload) => {
            const live = profileUsesRealApi();
            if (!live) {
                await new Promise((r) => setTimeout(r, 400));
                const key = [...queryKeys.profile.me, 'mock'];
                const prev =
                    qc.getQueryData<ProfileDTO>(key) ?? DUMMY_MINISTER_PROFILE;
                return applyMockProfileUpdate(prev, payload);
            }
            const res = await troottAPIClient().profile.updateMe(payload);
            if (res.error) {
                throw new Error(
                    (res.message as string | undefined) ?? 'Failed to update profile',
                );
            }
            return extractProfileDto(res);
        },
        onSuccess: (dto) => {
            const live = profileUsesRealApi();
            qc.setQueryData([...queryKeys.profile.me, live ? 'live' : 'mock'], dto);
        },
    });
}
