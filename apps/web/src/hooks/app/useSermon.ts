import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import api from '@/api/config';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    sermonQueryKeys,
    type MinisterSermonListParams,
} from '@/constants/sermon-query-keys';
import { parseMinisterSermonsResponse } from '@/utils/sermon-list-map.util';
import type {
    PublishSermonDTO,
    UpdateSermonDTO,
} from '@/dtos/sermon.dto';
import { MediaStatus } from '@/dtos/sermon-media.types';
import {
    startSermonAudioUpload,
    type StartSermonAudioUploadResult,
} from '@/services/upload/sermon-upload.service';

/** One-off GET for resume-draft, download, and other non-query flows. */
export async function fetchSermonDetail(sermonId: string): Promise<unknown> {
    const res = await api.sermon.getSermonById(sermonId);
    if (res.error) {
        throw new Error(res.message || 'Could not load sermon');
    }
    return res.data;
}

function wrapIApiAsAxiosShape(res: IAPIResponse): AxiosResponse<{ data?: unknown }> {
    return { data: res } as unknown as AxiosResponse<{ data?: unknown }>;
}

export function useMinisterSermonsQuery(
    ministerId: string | undefined,
    params: MinisterSermonListParams,
    options?: Omit<
        UseQueryOptions<Record<string, unknown>[]>,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery({
        queryKey: sermonQueryKeys.ministerList(ministerId ?? 'unknown', params),
        enabled: (options?.enabled ?? true) && Boolean(ministerId),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByMinister(ministerId!, {
                page: params.page,
                limit: params.limit,
                sort: params.sort,
                q: params.q,
                status: params.status,
                dateFrom: params.dateFrom,
                dateTo: params.dateTo,
            } as IListQuery);
            const { list } = parseMinisterSermonsResponse(
                wrapIApiAsAxiosShape(res),
            );
            return list;
        },
        ...options,
    });
}

export function useSermonByIdQuery(
    sermonId: string | undefined,
    options?: Omit<UseQueryOptions<unknown>, 'queryKey' | 'queryFn'>,
) {
    return useQuery({
        queryKey: [...sermonQueryKeys.all, 'detail', sermonId ?? ''],
        enabled: (options?.enabled ?? true) && Boolean(sermonId),
        queryFn: async () => {
            const res = await api.sermon.getSermonById(sermonId!);
            if (res.error) {
                throw new Error(res.message || 'Could not load sermon');
            }
            return res.data;
        },
        ...options,
    });
}

export function usePublishSermonMutation(
    options?: UseMutationOptions<
        IAPIResponse,
        Error,
        { id: string; payload: PublishSermonDTO }
    >,
) {
    const qc = useQueryClient();
    const { onSuccess, ...rest } = options ?? {};
    return useMutation({
        ...rest,
        mutationFn: async ({ id, payload }) =>
            api.sermon.publishSermon(id, payload),
        onSuccess: (data, variables, onMutateResult, context) => {
            void qc.invalidateQueries({ queryKey: sermonQueryKeys.all });
            if (
                !data.error &&
                variables.payload.status === MediaStatus.PUBLISHED
            ) {
                void api.minister
                    .onboardingFirstSermonComplete({})
                    .catch(() => undefined);
            }
            onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}

export function useStartSermonUploadMutation(
    options?: UseMutationOptions<
        StartSermonAudioUploadResult,
        Error,
        {
            formData: FormData;
            onProgress?: (percent: number) => void;
            signal?: AbortSignal;
        }
    >,
) {
    return useMutation({
        mutationFn: async ({ formData, onProgress, signal }) =>
            startSermonAudioUpload({ formData, onProgress, signal }),
        ...options,
    });
}

export function useUpdateSermonMutation(
    options?: UseMutationOptions<
        IAPIResponse,
        Error,
        { id: string; payload: UpdateSermonDTO }
    >,
) {
    const qc = useQueryClient();
    const { onSuccess, ...rest } = options ?? {};
    return useMutation({
        ...rest,
        mutationFn: async ({ id, payload }) =>
            api.sermon.updateSermon(id, payload),
        onSuccess: (data, variables, onMutateResult, context) => {
            void qc.invalidateQueries({ queryKey: sermonQueryKeys.all });
            onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}

export function useMoveSermonToBinMutation(
    options?: UseMutationOptions<
        IAPIResponse,
        Error,
        { id: string; payload?: Record<string, unknown> }
    >,
) {
    const qc = useQueryClient();
    const { onSuccess, ...rest } = options ?? {};
    return useMutation({
        ...rest,
        mutationFn: async ({ id, payload }) =>
            api.sermon.moveSermonToBin(id, payload),
        onSuccess: (data, variables, onMutateResult, context) => {
            void qc.invalidateQueries({ queryKey: sermonQueryKeys.all });
            onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
