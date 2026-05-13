import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    isMinisterProfile,
    type ProfileDTO,
    type UpdateProfilePayload,
} from '@/app/profile/profile.types';
import { DUMMY_MINISTER_PROFILE } from '@/app/profile/profile.dummy';

const PROFILE_UI_QUERY_KEY = ['profile', 'me', 'ui', 'mock'] as const;

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

/** Profile UI data: local mock only (`GET /profile/me` removed from API). */
export function useProfileQuery() {
    return useQuery({
        queryKey: PROFILE_UI_QUERY_KEY,
        queryFn: async () => DUMMY_MINISTER_PROFILE,
        staleTime: Infinity,
    });
}

/** Save profile: merges into React Query cache (mock only). */
export function useUpdateProfileMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateProfilePayload) => {
            await new Promise((r) => setTimeout(r, 400));
            const prev =
                qc.getQueryData<ProfileDTO>(PROFILE_UI_QUERY_KEY) ??
                DUMMY_MINISTER_PROFILE;
            return applyMockProfileUpdate(prev, payload);
        },
        onSuccess: (dto) => {
            qc.setQueryData(PROFILE_UI_QUERY_KEY, dto);
        },
    });
}
