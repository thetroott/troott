import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import EmptySermonsState from '@/components/shared/my-sermons/EmptySermonsState';
import SermonsTable from '@/components/shared/my-sermons/SermonsTable';
import apiCall from '@/api/config';
import { useUserStore } from '@/store/user-store';
import { resolveMinisterId } from '@/utils/minister-id.util';
import { sermonQueryKeys } from '@/constants/sermon-query-keys';
import { mapApiSermonToTableRow } from '@/utils/sermon-list-map.util';
import { devUploadDraftRowsToMinisterListDocs } from '@/utils/dev-upload-drafts.util';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Sermons = () => {
  const user = useUserStore((s) => s.user) as Record<string, unknown> | null;
  const ministerId = useMemo(() => resolveMinisterId(user), [user]);
  const isDev = import.meta.env.DEV;
  const queryEnabled = Boolean(ministerId) || isDev;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: sermonQueryKeys.minister(ministerId || '__dev__'),
    enabled: queryEnabled,
    queryFn: async () => {
      const devDocs = isDev ? devUploadDraftRowsToMinisterListDocs() : [];

      if (!ministerId) {
        return devDocs;
      }

      let apiList: Record<string, unknown>[] = [];
      try {
        const res = await apiCall.sermon.getSermonsByMinister(ministerId, {
          page: 1,
          limit: 50,
        });
        const body = res.data as { data?: unknown };
        const raw = body?.data;
        if (Array.isArray(raw)) apiList = raw as Record<string, unknown>[];
        else if (
          raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { sermons?: unknown }).sermons)
        ) {
          apiList = (raw as { sermons: Record<string, unknown>[] }).sermons;
        }
      } catch (e) {
        if (isDev && devDocs.length) {
          return devDocs;
        }
        throw e;
      }

      if (!isDev || !devDocs.length) {
        return apiList;
      }

      const apiIds = new Set(
        apiList.map((d) => String(d.id ?? d._id ?? '')).filter(Boolean),
      );
      const devOnly = devDocs.filter((d) => {
        const sid = d.sermonId;
        if (typeof sid !== 'string' || !sid) return true;
        return !apiIds.has(sid);
      });
      return [...devOnly, ...apiList];
    },
  });

  const sermons = useMemo(() => {
    if (!data?.length) return [];
    return data.map((doc) => mapApiSermonToTableRow(doc));
  }, [data]);

  if (!ministerId && !isDev) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-muted-foreground max-w-md">
          Your account is not linked to a minister profile yet, so sermon lists cannot be loaded.
          Upload and publish still work from Create sermon.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <p>Loading sermons…</p>
      </div>
    );
  }

  if (isError) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Could not load sermons.';
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
        <p className="text-destructive">{message}</p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!sermons.length) {
    return <EmptySermonsState />;
  }

  return <SermonsTable sermons={sermons} />;
};

export default Sermons;
