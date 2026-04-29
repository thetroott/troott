import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import EmptySermonsState from '@/components/shared/my-sermons/EmptySermonsState';
import SermonsTable from '@/components/shared/my-sermons/SermonsTable';
import apiCall from '@/api/config';
import { useUserStore } from '@/store/user-store';
import { resolveMinisterId } from '@/utils/minister-id.util';
import {
  DEFAULT_MINISTER_LIST_PARAMS,
  MY_SERMONS_PAGE_SIZE,
  sermonQueryKeys,
  type MinisterSermonListParams,
} from '@/constants/sermon-query-keys';
import {
  mapApiSermonToTableRow,
  parseMinisterSermonsResponse,
} from '@/utils/sermon-list-map.util';
import { devUploadDraftRowsToMinisterListDocs } from '@/utils/dev-upload-drafts.util';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/** Same token rules as API minister list search: every trimmed word must appear in title/description/topic/tags (case-insensitive). */
function rawDocMatchesSearchTerms(
  doc: Record<string, unknown>,
  q: string,
): boolean {
  const terms = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return true;
  const parts: string[] = [
    String(doc.title ?? '').toLowerCase(),
    String(doc.description ?? '').toLowerCase(),
    String(doc.topic ?? '').toLowerCase(),
  ];
  if (Array.isArray(doc.tags)) {
    for (const t of doc.tags) parts.push(String(t).toLowerCase());
  }
  const hay = parts.join(' ');
  return terms.every((t) => hay.includes(t));
}

function sortRawSermonDocs(
  docs: Record<string, unknown>[],
  sort: string,
): Record<string, unknown>[] {
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  const dir = desc ? -1 : 1;
  return [...docs].sort((a, b) => {
    if (field === 'title') {
      const ta = String(a.title ?? '').toLowerCase();
      const tb = String(b.title ?? '').toLowerCase();
      return ta < tb ? -dir : ta > tb ? dir : 0;
    }
    const da = new Date(
      String(a[field] ?? a.updatedAt ?? a.createdAt ?? 0),
    ).getTime();
    const db = new Date(
      String(b[field] ?? b.updatedAt ?? b.createdAt ?? 0),
    ).getTime();
    return (da - db) * dir;
  });
}

const Sermons = () => {
  const user = useUserStore((s) => s.user) as Record<string, unknown> | null;
  const ministerId = useMemo(() => resolveMinisterId(user), [user]);
  const isDev = import.meta.env.DEV;
  const queryEnabled = Boolean(ministerId) || isDev;

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listParams, setListParams] = useState<
    Omit<MinisterSermonListParams, 'q'>
  >({
    page: DEFAULT_MINISTER_LIST_PARAMS.page,
    limit: DEFAULT_MINISTER_LIST_PARAMS.limit,
    sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
    status: DEFAULT_MINISTER_LIST_PARAMS.status,
    dateFrom: DEFAULT_MINISTER_LIST_PARAMS.dateFrom,
    dateTo: DEFAULT_MINISTER_LIST_PARAMS.dateTo,
  });

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    );
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setListParams((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, [debouncedSearch]);

  const devDocs = useMemo(
    () => (isDev ? devUploadDraftRowsToMinisterListDocs() : []),
    [isDev],
  );

  const useDevMerge = Boolean(isDev && devDocs.length && ministerId);

  const listQueryKey = useMemo(
    () =>
      [
        ...sermonQueryKeys.all,
        'minister',
        ministerId || '__dev__',
        listParams.page,
        listParams.limit,
        listParams.sort,
        debouncedSearch,
        listParams.status,
        listParams.dateFrom,
        listParams.dateTo,
        useDevMerge,
      ] as const,
    [
      ministerId,
      listParams.page,
      listParams.limit,
      listParams.sort,
      debouncedSearch,
      listParams.status,
      listParams.dateFrom,
      listParams.dateTo,
      useDevMerge,
    ],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: listQueryKey,
    enabled: queryEnabled,
    queryFn: async ({ queryKey }) => {
      const ministerKey = String(queryKey[2] ?? '');
      const effectiveMinisterId =
        ministerKey === '__dev__' ? '' : ministerKey;

      const page = Number(queryKey[3]) || 1;
      const limit = Number(queryKey[4]) || MY_SERMONS_PAGE_SIZE;
      const sort = String(queryKey[5] ?? '-updatedAt');
      const q = String(queryKey[6] ?? '');
      const status = queryKey[7] as MinisterSermonListParams['status'];
      const dateFrom = String(queryKey[8] ?? '');
      const dateTo = String(queryKey[9] ?? '');
      const devMergeFlag = Boolean(queryKey[10]);

      const apiParamsBase = {
        sort,
        q: q || undefined,
        status: status === 'all' ? undefined : status,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

      const devDocsFresh = isDev ? devUploadDraftRowsToMinisterListDocs() : [];

      if (!effectiveMinisterId) {
        const devRows = q.trim()
          ? devDocsFresh.filter((d) => rawDocMatchesSearchTerms(d, q))
          : devDocsFresh;
        return { rows: devRows, total: devRows.length };
      }

      if (devMergeFlag && isDev) {
        try {
          const res = await apiCall.sermon.getSermonsByMinister(
            effectiveMinisterId,
            {
              page: 1,
              limit: 150,
              ...apiParamsBase,
            },
          );
          const { list: apiList } = parseMinisterSermonsResponse(res);

          const apiIds = new Set(
            apiList.map((d) => String(d.id ?? d._id ?? '')).filter(Boolean),
          );
          const devOnly = devDocsFresh
            .filter((d) => {
              const sid = d.sermonId;
              if (typeof sid === 'string' && sid && apiIds.has(sid)) {
                return false;
              }
              return !apiIds.has(String(d.id ?? d._id ?? ''));
            })
            .filter((d) => rawDocMatchesSearchTerms(d, q));
          const merged = [...devOnly, ...apiList];
          const sorted = sortRawSermonDocs(merged, sort);
          const total = sorted.length;
          const start = (page - 1) * MY_SERMONS_PAGE_SIZE;
          const slice = sorted.slice(start, start + MY_SERMONS_PAGE_SIZE);
          return { rows: slice, total };
        } catch {
          const devSubset = devDocsFresh.filter((d) =>
            rawDocMatchesSearchTerms(d, q),
          );
          const sorted = sortRawSermonDocs(devSubset, sort);
          const total = sorted.length;
          const start = (page - 1) * MY_SERMONS_PAGE_SIZE;
          return {
            rows: sorted.slice(start, start + MY_SERMONS_PAGE_SIZE),
            total,
          };
        }
      }

      try {
        const res = await apiCall.sermon.getSermonsByMinister(
          effectiveMinisterId,
          {
            page,
            limit,
            ...apiParamsBase,
          },
        );
        const { list, total } = parseMinisterSermonsResponse(res);
        return { rows: list, total };
      } catch (e) {
        if (isDev && devDocsFresh.length) {
          const devSubset = devDocsFresh.filter((d) =>
            rawDocMatchesSearchTerms(d, q),
          );
          const sorted = sortRawSermonDocs(devSubset, sort);
          const total = sorted.length;
          const start = (page - 1) * MY_SERMONS_PAGE_SIZE;
          return {
            rows: sorted.slice(start, start + MY_SERMONS_PAGE_SIZE),
            total,
          };
        }
        throw e;
      }
    },
  });

  const sermons = useMemo(() => {
    const rows = data?.rows ?? [];
    if (!rows.length) return [];
    return rows.map((doc) => mapApiSermonToTableRow(doc));
  }, [data?.rows]);

  const totalCount = data?.total ?? 0;

  const setPage = useCallback((p: number) => {
    setListParams((prev) => ({ ...prev, page: p }));
  }, []);

  const setSort = useCallback((sort: string) => {
    setListParams((prev) => ({ ...prev, sort, page: 1 }));
  }, []);

  const setStatus = useCallback((status: MinisterSermonListParams['status']) => {
    setListParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setDateFrom = useCallback((dateFrom: string) => {
    setListParams((prev) => ({ ...prev, dateFrom, page: 1 }));
  }, []);

  const setDateTo = useCallback((dateTo: string) => {
    setListParams((prev) => ({ ...prev, dateTo, page: 1 }));
  }, []);

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

  const hasListFilters =
    Boolean(debouncedSearch) ||
    listParams.status !== 'all' ||
    Boolean(listParams.dateFrom) ||
    Boolean(listParams.dateTo);

  if (!sermons.length && !hasListFilters) {
    return <EmptySermonsState />;
  }

  return (
    <SermonsTable
      listMode="remote"
      ministerId={ministerId}
      sermons={sermons}
      totalCount={totalCount}
      page={listParams.page}
      pageSize={MY_SERMONS_PAGE_SIZE}
      onPageChange={setPage}
      search={searchInput}
      onSearchChange={setSearchInput}
      sort={listParams.sort}
      onSortChange={setSort}
      status={listParams.status}
      onStatusChange={setStatus}
      dateFrom={listParams.dateFrom}
      dateTo={listParams.dateTo}
      onDateFromChange={setDateFrom}
      onDateToChange={setDateTo}
      isFetching={isFetching}
    />
  );
};

export default Sermons;
