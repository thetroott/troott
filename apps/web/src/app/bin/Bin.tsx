import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/config';
import { isApiHttp2xxErrorEnvelope } from '@/api/core/api-envelope-toast';
import { Button } from '@/components/ui/button';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import {
    DEFAULT_MINISTER_LIST_PARAMS,
    MY_SERMONS_PAGE_SIZE,
    sermonQueryKeys,
} from '@/constants/sermon-query-keys';
import {
    useDeleteSermonMutation,
    useRestoreSermonMutation,
} from '@/hooks/app/useSermon';
import {
    mapApiSermonToTableRow,
    parseMinisterSermonsResponse,
} from '@/utils/sermon-list-map.util';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';

const Bin = () => {
    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ownerId = useMemo(
        () =>
            resolveStudioSermonOwnerId(user, minister?.id, creatorId),
        [user, minister?.id, creatorId],
    );

    const restoreMutation = useRestoreSermonMutation();
    const deleteMutation = useDeleteSermonMutation();
    const [busyId, setBusyId] = useState<string | null>(null);

    const listParams = useMemo(
        () => ({
            page: DEFAULT_MINISTER_LIST_PARAMS.page,
            limit: DEFAULT_MINISTER_LIST_PARAMS.limit,
            sort: '-updatedAt' as const,
            q: '',
            dateFrom: '',
            dateTo: '',
        }),
        [],
    );

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ownerId
            ? sermonQueryKeys.binList(ownerId, listParams)
            : (['sermons', 'bin', 'none'] as const),
        enabled: Boolean(ownerId),
        queryFn: async () => {
            const res = await api.sermon.getSermonsByMinister(ownerId!, {
                page: listParams.page,
                limit: listParams.limit,
                sort: listParams.sort,
                status: 'bin',
            });
            const { list, total } = parseMinisterSermonsResponse(res);
            return { rows: list.map((doc) => mapApiSermonToTableRow(doc)), total };
        },
    });

    const rows = data?.rows ?? [];

    const handleRestore = useCallback(
        async (id: string) => {
            setBusyId(id);
            try {
                const res = await restoreMutation.mutateAsync({ id });
                if (res.error) {
                    if (!isApiHttp2xxErrorEnvelope(res)) {
                        toast.error(res.message || 'Could not restore sermon.');
                    }
                    return;
                }
                toast.success('Sermon restored to your library.');
                await refetch();
            } catch (e: unknown) {
                toast.error(
                    e && typeof e === 'object' && 'message' in e
                        ? String((e as { message: unknown }).message)
                        : 'Could not restore sermon.',
                );
            } finally {
                setBusyId(null);
            }
        },
        [refetch, restoreMutation],
    );

    const handleDeleteForever = useCallback(
        async (id: string) => {
            if (
                !window.confirm(
                    'Permanently delete this sermon? This cannot be undone.',
                )
            ) {
                return;
            }
            setBusyId(id);
            try {
                const res = await deleteMutation.mutateAsync({ id });
                if (res.error) {
                    if (!isApiHttp2xxErrorEnvelope(res)) {
                        toast.error(
                            res.message || 'Could not delete sermon.',
                        );
                    }
                    return;
                }
                toast.success('Sermon deleted permanently.');
                await refetch();
            } catch (e: unknown) {
                toast.error(
                    e && typeof e === 'object' && 'message' in e
                        ? String((e as { message: unknown }).message)
                        : 'Could not delete sermon.',
                );
            } finally {
                setBusyId(null);
            }
        },
        [deleteMutation, refetch],
    );

    if (!ownerId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground">
                <p className="max-w-md">
                    Your account is not linked to a studio profile, so the bin
                    cannot be loaded.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                <p>Loading bin…</p>
            </div>
        );
    }

    if (isError) {
        const message =
            error && typeof error === 'object' && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Could not load bin.';
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <p className="text-destructive">{message}</p>
                <Button type="button" variant="outline" onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className={MY_SERMONS_PAGE.pageBg}>
            <div className={MY_SERMONS_PAGE.mainColumn}>
                <header className={MY_SERMONS_PAGE.headerRow}>
                    <h1 className={MY_SERMONS_PAGE.title}>Bin</h1>
                    {isFetching ? (
                        <span className="sr-only">Updating bin</span>
                    ) : null}
                </header>

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                        <p className="text-sm">No sermons in the bin.</p>
                        <p className="text-xs mt-2 max-w-sm">
                            Sermons you move to trash from My Sermons appear
                            here. You can restore them or delete them
                            permanently.
                        </p>
                    </div>
                ) : (
                    <ul className="mt-4 divide-y divide-[#545454]/50 rounded-lg border border-[#545454]/50 overflow-hidden">
                        {rows.map((row) => {
                            const busy = busyId === row.id;
                            return (
                                <li
                                    key={row.id}
                                    className="flex flex-wrap items-center justify-between gap-3 bg-[#333234]/40 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-matter-medium text-sm text-[#eaeaea] truncate">
                                            {row.name || 'Untitled sermon'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {row.duration || '—'} · Updated{' '}
                                            {row.dateCreated || '—'}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() =>
                                                void handleRestore(row.id)
                                            }
                                        >
                                            <RotateCcw
                                                className="h-4 w-4 mr-1"
                                                aria-hidden
                                            />
                                            Restore
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={busy}
                                            onClick={() =>
                                                void handleDeleteForever(row.id)
                                            }
                                        >
                                            <Trash2
                                                className="h-4 w-4 mr-1"
                                                aria-hidden
                                            />
                                            Delete forever
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Bin;
