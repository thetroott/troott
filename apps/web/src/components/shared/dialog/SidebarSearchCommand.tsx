import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideBookAudio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    SIDEBAR_SEARCH_GROUP_ORDER,
    SIDEBAR_SEARCH_GROUP_ORDER_WITH_SERMONS,
    SIDEBAR_SEARCH_INDEX,
} from '@/constants/sidebar-search-index';
import { DEFAULT_MINISTER_LIST_PARAMS } from '@/constants/sermon-query-keys';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import useContextType from '@/hooks/shared/useContextType';
import useSidebarStudioCode from '@/hooks/shared/useSidebarStudioCode';
import { useCreateSermonEntry } from '@/hooks/upload/useCreateSermonEntry';
import { useMinisterSermonsQuery } from '@/hooks/app/useSermon';
import { UserType } from '@/models/User.model';
import cookieService from '@/api/services/cookies';
import { MediaStatus } from '@/dtos/sermon-media.types';
import {
    PATH_SEG_BIN,
    studioHomePath,
} from '@/routes/paths';
import { cn } from '@/lib/utils';
import {
    isStudioOnboardingComplete,
    shouldShowGetStartedNavItem,
} from '@/utils/portal-onboarding.util';
import { normalizePortalUserType } from '@/utils/roles.util';
import { navigateOnSermonEdit } from '@/utils/sermon-edit-routing.util';
import { isSermonDraftDocument } from '@/utils/sermon-info-map.util';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import {
    commandValueForItem,
    filterSearchIndex,
    getSearchItemDisabledReason,
    groupSearchItems,
    isPureAdminUser,
    queryIncludesBinScope,
    resolveSearchItemHref,
    type SearchIndexGroup,
    type SearchIndexItem,
    type SidebarSearchContext,
} from '@/utils/sidebar-search.util';
import UploadEntryStepModal from '@/components/shared/upload/UploadEntryStepModal';

const SERMON_SEARCH_MIN_LENGTH = 2;
const SERMON_SEARCH_DEBOUNCE_MS = 300;
const SERMON_RESULT_LIMIT = 8;

function isSermonBinDocument(doc: Record<string, unknown>): boolean {
    const status = String(doc.status ?? '').toLowerCase();
    const state = String(doc.state ?? '').toLowerCase();
    return (
        status === MediaStatus.DELETED ||
        status.includes('deleted') ||
        state.includes('deleted')
    );
}

function sermonResultSubtitle(doc: Record<string, unknown>): string {
    if (isSermonBinDocument(doc)) {
        return 'In bin';
    }
    return isSermonDraftDocument(doc) ? 'Draft' : 'Published';
}

type SidebarSearchCommandProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function SidebarSearchCommand({
    open,
    onOpenChange,
}: SidebarSearchCommandProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const { userContext } = useContextType();
    const { minister } = useMinister();
    const { creator, creatorId } = useCreator();
    const sidebarStudioCode = useSidebarStudioCode();
    const {
        startUploadFlow,
        entryModalOpen,
        setEntryModalOpen,
        onFileSelected,
        isLoading: uploadEntryLoading,
    } = useCreateSermonEntry();

    const user = userContext.user as Record<string, unknown> | null;
    const userType = normalizePortalUserType(
        userContext.userType || cookieService.getUserType() || UserType.MINISTER,
    );

    const onboardingComplete = isStudioOnboardingComplete(
        userType,
        minister,
        user as { onboard?: { status?: string } } | null,
        creator,
    );

    const showGetStarted = shouldShowGetStartedNavItem(
        userType,
        minister,
        user as { onboard?: { status?: string } } | null,
        creator,
    );

    const searchCtx: SidebarSearchContext = useMemo(
        () => ({
            userType,
            studioCode: sidebarStudioCode,
            onboardingComplete,
            showGetStarted,
        }),
        [userType, sidebarStudioCode, onboardingComplete, showGetStarted],
    );

    const ownerId = useMemo(
        () => resolveStudioSermonOwnerId(user, minister?.id, creatorId),
        [user, minister?.id, creatorId],
    );

    useEffect(() => {
        const t = window.setTimeout(
            () => setDebouncedQuery(query.trim()),
            SERMON_SEARCH_DEBOUNCE_MS,
        );
        return () => window.clearTimeout(t);
    }, [query]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setDebouncedQuery('');
        }
    }, [open]);

    const visibleStaticItems = useMemo(
        () => filterSearchIndex(SIDEBAR_SEARCH_INDEX, searchCtx),
        [searchCtx],
    );

    const groupedStatic = useMemo(
        () => groupSearchItems(visibleStaticItems),
        [visibleStaticItems],
    );

    const includeBin = queryIncludesBinScope(debouncedQuery);
    const sermonSearchEnabled =
        open &&
        debouncedQuery.length >= SERMON_SEARCH_MIN_LENGTH &&
        Boolean(ownerId) &&
        !isPureAdminUser(userType) &&
        onboardingComplete;

    const libraryParams = useMemo(
        () => ({
            page: 1,
            limit: includeBin ? 4 : SERMON_RESULT_LIMIT,
            sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
            q: debouncedQuery,
            status: 'all' as const,
            dateFrom: '',
            dateTo: '',
        }),
        [debouncedQuery, includeBin],
    );

    const binParams = useMemo(
        () => ({
            page: 1,
            limit: 4,
            sort: DEFAULT_MINISTER_LIST_PARAMS.sort,
            q: debouncedQuery,
            status: 'bin' as const,
            dateFrom: '',
            dateTo: '',
        }),
        [debouncedQuery],
    );

    const libraryQuery = useMinisterSermonsQuery(ownerId, libraryParams, {
        enabled: sermonSearchEnabled,
    });

    const binQuery = useMinisterSermonsQuery(ownerId, binParams, {
        enabled: sermonSearchEnabled && includeBin,
    });

    useEffect(() => {
        if (libraryQuery.isError || binQuery.isError) {
            toast.error('Could not search sermons');
        }
    }, [libraryQuery.isError, binQuery.isError]);

    const sermonResults = useMemo(() => {
        if (!sermonSearchEnabled) {
            return [];
        }
        const library = libraryQuery.data ?? [];
        const bin = includeBin ? (binQuery.data ?? []) : [];
        const seen = new Set<string>();
        const merged: Record<string, unknown>[] = [];

        for (const doc of [...library, ...bin]) {
            const id = String(doc.id ?? doc._id ?? '');
            if (!id || seen.has(id)) {
                continue;
            }
            seen.add(id);
            merged.push(doc);
            if (merged.length >= SERMON_RESULT_LIMIT) {
                break;
            }
        }
        return merged;
    }, [
        sermonSearchEnabled,
        libraryQuery.data,
        binQuery.data,
        includeBin,
    ]);

    const sermonLoading =
        sermonSearchEnabled &&
        (libraryQuery.isFetching || (includeBin && binQuery.isFetching));

    const groupOrder: SearchIndexGroup[] = useMemo(() => {
        const base =
            debouncedQuery.length >= SERMON_SEARCH_MIN_LENGTH
                ? SIDEBAR_SEARCH_GROUP_ORDER_WITH_SERMONS
                : SIDEBAR_SEARCH_GROUP_ORDER;
        if (debouncedQuery.length > 0 && !base.includes('Settings')) {
            return [...base, 'Settings'];
        }
        return base;
    }, [debouncedQuery]);

    const showSermonGroup =
        sermonSearchEnabled &&
        (sermonLoading || sermonResults.length > 0);

    const handleStaticSelect = useCallback(
        (item: SearchIndexItem) => {
            const reason = getSearchItemDisabledReason(item, searchCtx);
            if (reason) {
                return;
            }

            onOpenChange(false);

            if (item.action === 'create-sermon') {
                startUploadFlow();
                return;
            }

            const href = resolveSearchItemHref(item, searchCtx);
            if (href) {
                navigate(href);
            }
        },
        [navigate, onOpenChange, searchCtx, startUploadFlow],
    );

    const handleSermonSelect = useCallback(
        (doc: Record<string, unknown>) => {
            onOpenChange(false);
            const code = sidebarStudioCode;
            if (!code) {
                toast.error('Studio not ready');
                return;
            }

            const sermonId = String(doc.id ?? doc._id ?? '');
            if (!sermonId) {
                return;
            }

            if (isSermonBinDocument(doc)) {
                navigate(`${studioHomePath(code)}/${PATH_SEG_BIN}`);
                return;
            }

            navigateOnSermonEdit(navigate, code, sermonId, { doc });
        },
        [navigate, onOpenChange, sidebarStudioCode],
    );

    return (
        <>
            <CommandDialog open={open} onOpenChange={onOpenChange}>
                <CommandInput
                    placeholder="Search Troott…"
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {debouncedQuery
                            ? `No results for "${debouncedQuery}"`
                            : 'No results found.'}
                    </CommandEmpty>

                    {groupOrder.map((groupName) => {
                        if (groupName === 'Sermons') {
                            if (!showSermonGroup) {
                                return null;
                            }
                            return (
                                <CommandGroup key={groupName} heading={groupName}>
                                    {sermonLoading && sermonResults.length === 0 ? (
                                        <CommandItem
                                            disabled
                                            value="sermon-search-loading"
                                        >
                                            <Loader2 className="size-4 animate-spin opacity-60" />
                                            <span>Searching…</span>
                                        </CommandItem>
                                    ) : null}
                                    {sermonResults.map((doc) => {
                                        const id = String(doc.id ?? doc._id ?? '');
                                        const title =
                                            (doc.title as string) || 'Untitled';
                                        const subtitle =
                                            sermonResultSubtitle(doc);
                                        return (
                                            <CommandItem
                                                key={`sermon-${id}`}
                                                value={`${title} ${subtitle} sermon`}
                                                onSelect={() =>
                                                    handleSermonSelect(doc)
                                                }
                                            >
                                                <LucideBookAudio className="size-4 opacity-60" />
                                                <span className="flex min-w-0 flex-1 flex-col">
                                                    <span className="truncate">
                                                        {title}
                                                    </span>
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        {subtitle}
                                                    </span>
                                                </span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            );
                        }

                        const items = groupedStatic.get(groupName);
                        if (!items?.length) {
                            return null;
                        }

                        return (
                            <CommandGroup key={groupName} heading={groupName}>
                                {items.map((item) => {
                                    const disabledReason =
                                        getSearchItemDisabledReason(
                                            item,
                                            searchCtx,
                                        );
                                    const Icon = item.icon;
                                    return (
                                        <CommandItem
                                            key={item.id}
                                            value={commandValueForItem(item)}
                                            disabled={Boolean(disabledReason)}
                                            onSelect={() =>
                                                handleStaticSelect(item)
                                            }
                                            className={cn(
                                                disabledReason &&
                                                    'opacity-60',
                                            )}
                                        >
                                            {Icon ? (
                                                <Icon className="size-4 opacity-60" />
                                            ) : null}
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span>{item.title}</span>
                                                {disabledReason ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {disabledReason}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        );
                    })}
                </CommandList>
            </CommandDialog>

            <UploadEntryStepModal
                open={entryModalOpen}
                onOpenChange={setEntryModalOpen}
                onFileSelected={onFileSelected}
                isLoading={uploadEntryLoading}
            />
        </>
    );
}
