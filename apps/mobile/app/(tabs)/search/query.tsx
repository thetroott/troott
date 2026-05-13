import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    UIManager,
    View,
} from 'react-native';
import { CloseCircle, SearchNormal } from 'iconsax-react-nativejs';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import Input from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import SearchCatalogResults, {
    type SearchFilterChip,
} from '@/components/features/search/search-catalog-results';
import SearchNoResults from '@/components/features/search/search-no-results';
import ClearRecentSearchesDialog from '@/components/features/search/clear-recent-searches-dialog';
import RecentSuggestionLabel from '@/components/features/search/recent-suggestion-label';
import SearchArrowRightUp from '@/components/features/search/search-arrow-right-up';
import SearchRecentEmptyState from '@/components/features/search/search-recent-empty-state';
import SearchHistoryList from '@/components/features/search/search-history-list';
import SearchEmptyDiscovery from '@/components/features/search/search-empty-discovery';
import { captureSearchEvent } from '@/components/features/search/search.analytics';
import {
    useCatalogSearchQuery,
    useSearchHistory,
} from '@/api/hooks/app/useSearch';
import { useCommittedSearchTerm } from '@/api/hooks/shared/use-committed-search-term';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import { useNetworkStatus } from '@/stores/app/network';
import { networkStatusTypes } from '@/types/network-status';
import { QueuingType } from '@/utils/enums.util';
import { tracks } from '@/_data/_mock/tracks';
import {
    filterBundledCatalogByQuery,
    mergeSermonSearchResults,
} from '@/engine/utils/catalog-local-search';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import {
    usePlaylistsQuery,
    useUserLibraryQuery,
} from '@/api/hooks/app/useLibrary';
import { useContextType } from '@/state/app-state';
import {
    getLibraryArrayField,
    playlistDocToRow,
    sermonDocToCatalogRow,
} from '@/engine/utils/library-map';
import type { SearchHistoryEntry } from '@/lib/library-recent-search-storage';
import {
    canonicalSearchQuery,
    SEARCH_FIELD_FILL,
    SEARCH_MIN_QUERY_LENGTH,
    SEARCH_QUERY_PLACEHOLDER,
    SEARCH_QUERY_PLACEHOLDER_EMPTY_HISTORY,
    TRENDING_SEARCH_QUERIES,
} from '@/constants/search-ui';

type TypingSuggestionRow =
    | { kind: 'recent'; entry: SearchHistoryEntry }
    | { kind: 'catalog'; title: string };

function normalizePlaylistList(data: unknown): unknown[] {
    if (data == null) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null && 'items' in data) {
        const items = (data as { items: unknown }).items;
        return Array.isArray(items) ? items : [];
    }
    return [];
}

function matches(q: string, ...parts: (string | undefined | null)[]): boolean {
    const needle = q.trim().toLowerCase();
    if (!needle) return false;
    return parts.some(
        (p) => p != null && String(p).toLowerCase().includes(needle),
    );
}

function findSermonIndexByExactTitle(
    title: string,
    list: SermonItemDTO[],
): number {
    const needle = title.trim().toLowerCase();
    if (!needle) return -1;
    return list.findIndex(
        (s) => (s.title ?? '').trim().toLowerCase() === needle,
    );
}

function libraryMatchingSermonIds(lib: unknown, q: string): Set<string> {
    const needle = q.trim().toLowerCase();
    const sermonIds = new Set<string>();
    if (!needle) return sermonIds;

    const likedRaw = getLibraryArrayField(lib, 'likedSermons');
    const playedRaw = getLibraryArrayField(lib, 'mostPlayed');
    for (const doc of [...likedRaw, ...playedRaw]) {
        const row = sermonDocToCatalogRow(doc);
        if (!row?.id) continue;
        const title = row.title ?? '';
        const minister = row.minister ?? '';
        if (matches(needle, title, minister)) sermonIds.add(row.id);
    }
    return sermonIds;
}

export default function SearchQueryScreen() {
    const { q: qParam } = useLocalSearchParams<{ q?: string }>();
    const initialFromRoute =
        typeof qParam === 'string' && qParam.trim().length > 0 ? qParam : '';

    const [query, setQuery] = useState(initialFromRoute);
    const [clearRecentOpen, setClearRecentOpen] = useState(false);

    useEffect(() => {
        if (typeof qParam === 'string' && qParam.trim().length > 0) {
            setQuery(qParam);
        }
    }, [qParam]);
    const [chip, setChip] = useState<SearchFilterChip>('Sermon');

    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    const {
        entries: recentEntries,
        addEntry,
        removeEntry,
        clearAll,
        filteredByPrefix,
    } = useSearchHistory(userId);

    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    const dismissSearch = useCallback(() => {
        router.back();
    }, []);

    useEffect(() => {
        if (
            Platform.OS === 'android' &&
            UIManager.setLayoutAnimationEnabledExperimental
        ) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const { data: lib } = useUserLibraryQuery(!!userId);
    const { data: playlistsRaw } = usePlaylistsQuery(!!userId);
    const { data: sermonsCatalog } = useSermonsCatalog();

    const {
        normalizedLive,
        committedSearch,
        flushCommittedSearch,
        isCommittedSynced,
    } = useCommittedSearchTerm(query);

    const queryTextRef = useRef(query);
    queryTextRef.current = query;
    const committedSearchRef = useRef(committedSearch);
    committedSearchRef.current = committedSearch;
    const committedSyncedRef = useRef(isCommittedSynced);
    committedSyncedRef.current = isCommittedSynced;
    const addEntryBlurRef = useRef(addEntry);
    addEntryBlurRef.current = addEntry;

    /**
     * Persist typed query when leaving search after a committed run (debounced “intent”),
     * not only on keyboard Search — matches Spotify-style recents after browsing results.
     */
    useFocusEffect(
        useCallback(() => {
            return () => {
                const raw = queryTextRef.current.trim();
                if (
                    !committedSyncedRef.current ||
                    raw.length < SEARCH_MIN_QUERY_LENGTH ||
                    committedSearchRef.current.length <
                        SEARCH_MIN_QUERY_LENGTH
                ) {
                    return;
                }
                addEntryBlurRef.current(raw, 'generic');
            };
        }, []),
    );

    const searchEnabled =
        committedSearch.length >= SEARCH_MIN_QUERY_LENGTH;

    const {
        data: catalog,
        isFetching,
        isError,
        isFetched,
        isPlaceholderData,
        refetch: refetchCatalogSearch,
    } = useCatalogSearchQuery(committedSearch, searchEnabled);

    const bundledRows = useMemo<ISermonTrack[]>(() => {
        if (sermonsCatalog && sermonsCatalog.length > 0) {
            return sermonsCatalog as ISermonTrack[];
        }
        return tracks as ISermonTrack[];
    }, [sermonsCatalog]);

    const bundledAsSermonItems = useMemo(
        () =>
            bundledRows.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id: r.id != null ? String(r.id) : `bundled-${i}`,
                }),
            ),
        [bundledRows],
    );

    /** Local catalogue slice matches the committed term only — avoids flicker while typing. */
    const bundledSermonHits = useMemo(
        () => filterBundledCatalogByQuery(bundledRows, committedSearch),
        [bundledRows, committedSearch],
    );

    const filteredRecentEntries = useMemo(
        () => filteredByPrefix(query.trim()),
        [filteredByPrefix, query],
    );

    const searchPlaceholder = useMemo(
        () =>
            recentEntries.length === 0
                ? SEARCH_QUERY_PLACEHOLDER_EMPTY_HISTORY
                : SEARCH_QUERY_PLACEHOLDER,
        [recentEntries.length],
    );

    const popularDiscovery = useMemo(
        () => bundledRows.slice(0, 8),
        [bundledRows],
    );

    const recentPlayedDiscovery = useMemo(() => {
        if (!lib) return [];
        const raw = getLibraryArrayField(lib, 'mostPlayed');
        const out: ISermonTrack[] = [];
        for (const doc of raw) {
            const row = sermonDocToCatalogRow(doc);
            if (!row?.id) continue;
            out.push(row as ISermonTrack);
        }
        return out.slice(0, 8);
    }, [lib]);

    /** Title-prefix suggestions from bundled catalog (Figma type-ahead 5176:22776). */
    const catalogPrefixSuggestions = useMemo(() => {
        const p = normalizedLive;
        if (p.length === 0) return [];
        const seen = new Set(
            filteredRecentEntries.map((e) => e.query.trim().toLowerCase()),
        );
        const out: string[] = [];
        for (const r of bundledRows) {
            const title = r.title?.trim();
            if (!title) continue;
            const low = title.toLowerCase();
            if (!low.startsWith(p)) continue;
            const k = low;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(title);
            if (out.length >= 12) break;
        }
        return out;
    }, [bundledRows, normalizedLive, filteredRecentEntries]);

    const typingSuggestionRows = useMemo((): TypingSuggestionRow[] => {
        const rows: TypingSuggestionRow[] = filteredRecentEntries.map(
            (entry) => ({
                kind: 'recent',
                entry,
            }),
        );
        const seen = new Set(
            filteredRecentEntries.map((e) =>
                e.query.trim().toLowerCase(),
            ),
        );
        for (const title of catalogPrefixSuggestions) {
            const low = title.trim().toLowerCase();
            if (seen.has(low)) continue;
            seen.add(low);
            rows.push({ kind: 'catalog', title });
        }
        return rows;
    }, [filteredRecentEntries, catalogPrefixSuggestions]);

    const playlistHits = useMemo(() => {
        const rows = normalizePlaylistList(playlistsRaw);
        const needle = committedSearch;
        if (!needle) return [];
        const out: {
            id: string;
            title: string;
            description?: string;
            image?: string;
        }[] = [];
        for (const doc of rows) {
            const pl = playlistDocToRow(doc);
            if (!pl) continue;
            if (!matches(needle, pl.title, pl.description)) continue;
            out.push(pl);
        }
        return out;
    }, [playlistsRaw, committedSearch]);

    const sermonsFromApi = catalog?.sermons ?? [];
    const ministers = catalog?.ministers ?? [];

    const sermonsMerged = useMemo(
        () => mergeSermonSearchResults(sermonsFromApi, bundledSermonHits),
        [sermonsFromApi, bundledSermonHits],
    );

    const preferredIds = useMemo(
        () => libraryMatchingSermonIds(lib, committedSearch),
        [lib, committedSearch],
    );

    const sermonsOrdered = useMemo(() => {
        if (!sermonsMerged.length) return sermonsMerged;
        const ids = preferredIds;
        return [...sermonsMerged].sort((a, b) => {
            const fa = a.id != null && ids.has(String(a.id)) ? 1 : 0;
            const fb = b.id != null && ids.has(String(b.id)) ? 1 : 0;
            return fb - fa;
        });
    }, [sermonsMerged, preferredIds]);

    /**
     * When a suggestion exactly matches a sermon title, load the queue and leave search
     * (same outcome as tapping a sermon in results).
     */
    const tryPlaySermonByExactTitle = useCallback(
        async (title: string): Promise<boolean> => {
            const primaryList: SermonItemDTO[] =
                searchEnabled && sermonsOrdered.length > 0
                    ? sermonsOrdered
                    : bundledAsSermonItems;

            const index = findSermonIndexByExactTitle(title, primaryList);
            if (index < 0 || primaryList[index]?.id == null) return false;

            try {
                await loadNewQueue({
                    api: undefined,
                    networkStatus:
                        networkStatus ?? networkStatusTypes.ONLINE,
                    track: primaryList[index],
                    index,
                    tracklist: primaryList,
                    queue: 'Search',
                    queuingType: QueuingType.FromSelection,
                    startPlayback: true,
                });
                const term = title.trim();
                if (term.length > 0) addEntry(term, 'sermon');
                dismissSearch();
                return true;
            } catch {
                return false;
            }
        },
        [
            searchEnabled,
            sermonsOrdered,
            bundledAsSermonItems,
            loadNewQueue,
            networkStatus,
            dismissSearch,
            addEntry,
        ],
    );

    const hasCatalogHits =
        sermonsOrdered.length > 0 ||
        ministers.length > 0 ||
        playlistHits.length > 0;

    const recordSearch = useCallback(
        (term: string) => {
            addEntry(term, 'generic');
        },
        [addEntry],
    );

    const onSermonPlayedFromCatalog = useCallback(
        (sermonTitle: string) => {
            const fromQuery = (
                isCommittedSynced ? query.trim() || committedSearch : committedSearch
            ).trim();
            const term =
                fromQuery.length > 0 ? fromQuery : sermonTitle.trim();
            if (term.length > 0) addEntry(term, 'sermon');
            dismissSearch();
        },
        [
            isCommittedSynced,
            query,
            committedSearch,
            addEntry,
            dismissSearch,
        ],
    );

    const removeHistoryEntry = useCallback(
        (entryId: string) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeEntry(entryId);
        },
        [removeEntry],
    );

    const submitCurrentQuery = useCallback(() => {
        flushCommittedSearch();
        const t = query.trim();
        if (t) {
            captureSearchEvent('search_committed', {
                query_canonical: canonicalSearchQuery(t),
            });
            recordSearch(t);
        }
    }, [query, flushCommittedSearch, recordSearch]);

    /** MMKV-only reset; catalog React Query cache stays warm (Spotify-style). */
    const confirmClearRecent = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        captureSearchEvent('search_history_cleared');
        clearAll();
        setClearRecentOpen(false);
    }, [clearAll]);

    const showEmptyLanding = !query.trim();
    const typing = query.trim().length > 0;

    const showNoMatches =
        searchEnabled &&
        isCommittedSynced &&
        !isFetching &&
        isFetched &&
        !isError &&
        !hasCatalogHits;

    /** Hard failure with nothing to show (no prefix / prior placeholder data). */
    const showSearchLoadError =
        searchEnabled &&
        isCommittedSynced &&
        !isFetching &&
        isFetched &&
        isError &&
        !hasCatalogHits;

    /** Keep showing cached or placeholder hits while surfacing a soft refresh failure. */
    const showStaleRefreshBanner =
        searchEnabled && isCommittedSynced && isError && hasCatalogHits;

    const showResults = searchEnabled && hasCatalogHits;

    const showInlineSearchLoading =
        searchEnabled &&
        isCommittedSynced &&
        isFetching &&
        !isPlaceholderData &&
        !hasCatalogHits;

    return (
        <ScreenView style={styles.screen}>
            <ClearRecentSearchesDialog
                visible={clearRecentOpen}
                onDismiss={() => setClearRecentOpen(false)}
                onConfirmClear={confirmClearRecent}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flexGrow}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
            <View style={styles.topRow}>
                <View style={styles.inputShell}>
                    <Input
                        value={query}
                        onChangeText={(t) => {
                            setQuery(t);
                            setChip('Sermon');
                        }}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={submitCurrentQuery}
                        cursorColor={theme.colors.teal[400]}
                        selectionColor={`${theme.colors.teal[400]}44`}
                        placeholderTextColor={theme.colors.grey[400]}
                        leftIcon={
                            <SearchNormal
                                size={20}
                                color={
                                    query.trim().length > 0
                                        ? theme.colors.white[50]
                                        : theme.colors.grey[400]
                                }
                            />
                        }
                        placeholder={searchPlaceholder}
                        containerstyle={styles.searchField}
                        inputcontainerstyles={{
                            color: theme.colors.white[50],
                            ...(query.length > 0
                                ? { paddingRight: theme.sizes.spacing.xl }
                                : {}),
                        }}
                    />
                    {query.length > 0 ? (
                        <Pressable
                            style={styles.inputClear}
                            onPress={() => setQuery('')}
                            accessibilityRole="button"
                            accessibilityLabel="Clear search"
                            hitSlop={8}
                        >
                            <CloseCircle
                                size={22}
                                color={theme.colors.grey[300]}
                            />
                        </Pressable>
                    ) : null}
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel search"
                    hitSlop={8}
                >
                    <Text
                        size="sm"
                        weight="medium"
                        color={theme.colors.grey[300]}
                    >
                        Cancel
                    </Text>
                </Pressable>
            </View>

            {showEmptyLanding ? (
                recentEntries.length > 0 ? (
                    <View style={styles.flexGrow}>
                        <SearchHistoryList
                            entries={recentEntries}
                            onSelect={(entry) => {
                                void tryPlaySermonByExactTitle(
                                    entry.query,
                                ).then((played) => {
                                    if (!played) {
                                        setQuery(entry.query);
                                        flushCommittedSearch(entry.query);
                                        addEntry(
                                            entry.query,
                                            entry.type,
                                        );
                                    }
                                });
                            }}
                            onRemove={removeHistoryEntry}
                            ListFooterComponent={
                                <Pressable
                                    style={styles.clearPill}
                                    onPress={() => setClearRecentOpen(true)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear recent searches"
                                >
                                    <Text
                                        size="xs"
                                        weight="regular"
                                        color={theme.colors.grey[50]}
                                    >
                                        Clear recent searches
                                    </Text>
                                </Pressable>
                            }
                        />
                    </View>
                ) : (
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.landingEmptyWrap}
                    >
                        <View style={styles.emptyHero}>
                            <SearchRecentEmptyState />
                        </View>
                    </ScrollView>
                )
            ) : typing ? (
                <View style={styles.flexGrow}>
                    {typingSuggestionRows.length > 0 ? (
                        <>
                            <Text
                                weight="semiBold"
                                size="md"
                                color={theme.colors.white[50]}
                                style={styles.sectionHdr}
                            >
                                Recent searches
                            </Text>
                            {typingSuggestionRows.map((row) =>
                                row.kind === 'recent' ? (
                                    <Pressable
                                        key={row.entry.id}
                                        style={styles.suggestionRow}
                                        onPress={() => {
                                            void tryPlaySermonByExactTitle(
                                                row.entry.query,
                                            ).then((played) => {
                                                if (!played) {
                                                    setQuery(row.entry.query);
                                                    flushCommittedSearch(
                                                        row.entry.query,
                                                    );
                                                    recordSearch(
                                                        row.entry.query,
                                                    );
                                                }
                                            });
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={row.entry.query}
                                    >
                                        <View style={styles.suggestionLabel}>
                                            <RecentSuggestionLabel
                                                text={row.entry.query}
                                                prefix={query}
                                            />
                                        </View>
                                        <SearchArrowRightUp
                                            color={theme.colors.white[50]}
                                            size={24}
                                        />
                                    </Pressable>
                                ) : (
                                    <Pressable
                                        key={`cat-${row.title}`}
                                        style={styles.suggestionRow}
                                        onPress={() => {
                                            void tryPlaySermonByExactTitle(
                                                row.title,
                                            ).then((played) => {
                                                if (!played) {
                                                    setQuery(row.title);
                                                    flushCommittedSearch(
                                                        row.title,
                                                    );
                                                    recordSearch(row.title);
                                                }
                                            });
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={row.title}
                                    >
                                        <View style={styles.suggestionLabel}>
                                            <RecentSuggestionLabel
                                                text={row.title}
                                                prefix={query}
                                            />
                                        </View>
                                        <SearchArrowRightUp
                                            color={theme.colors.white[50]}
                                            size={24}
                                        />
                                    </Pressable>
                                ),
                            )}
                        </>
                    ) : null}

                    {searchEnabled ? (
                        <View style={styles.resultsPane}>
                            {showInlineSearchLoading ? (
                                <View
                                    style={styles.loadingCenter}
                                    accessibilityLabel="Searching"
                                >
                                    <View style={styles.loaderScale}>
                                        <Loader tone="brand" />
                                    </View>
                                    <Text
                                        size="sm"
                                        color={theme.colors.grey[400]}
                                    >
                                        Searching...
                                    </Text>
                                </View>
                            ) : null}
                            {showStaleRefreshBanner ? (
                                <Pressable
                                    style={styles.staleBanner}
                                    onPress={() => {
                                        void refetchCatalogSearch();
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Retry refreshing search results"
                                >
                                    <Text
                                        size="xs"
                                        color={theme.colors.grey[300]}
                                    >
                                        Couldn&apos;t refresh results. Tap to
                                        retry.
                                    </Text>
                                </Pressable>
                            ) : null}
                            {showResults ? (
                                <SearchCatalogResults
                                    chip={chip}
                                    onChipChange={setChip}
                                    sermons={sermonsOrdered}
                                    ministers={ministers}
                                    playlists={playlistHits}
                                    queryLabel={
                                        isCommittedSynced
                                            ? query.trim() ||
                                              committedSearch
                                            : committedSearch
                                    }
                                    onSermonPlaybackStarted={
                                        onSermonPlayedFromCatalog
                                    }
                                />
                            ) : showSearchLoadError ? (
                                <View
                                    style={styles.searchErrorWrap}
                                    accessibilityLabel="Search failed"
                                >
                                    <Text
                                        size="sm"
                                        color={theme.colors.grey[300]}
                                        style={styles.searchErrorText}
                                    >
                                        Something went wrong. Check your
                                        connection and try again.
                                    </Text>
                                    <Pressable
                                        style={styles.retryButton}
                                        onPress={() => {
                                            captureSearchEvent(
                                                'search_retry_tapped',
                                            );
                                            void refetchCatalogSearch();
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Retry search"
                                    >
                                        <Text
                                            size="sm"
                                            weight="semiBold"
                                            color={theme.colors.teal[400]}
                                        >
                                            Retry
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : showNoMatches ? (
                                <SearchNoResults />
                            ) : null}
                        </View>
                    ) : normalizedLive.length === 1 ? (
                        <Text
                            size="sm"
                            color={theme.colors.grey[400]}
                            style={styles.pad}
                        >
                            Type at least {SEARCH_MIN_QUERY_LENGTH}{' '}
                            characters to search.
                        </Text>
                    ) : null}
                </View>
            ) : null}
            </KeyboardAvoidingView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.grey[950],
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        marginBottom: theme.sizes.spacing.lg,
    },
    inputShell: {
        flex: 1,
        minWidth: 0,
        position: 'relative',
        justifyContent: 'center',
    },
    searchField: {
        width: '100%',
        height: 44,
        minHeight: 44,
        maxHeight: 44,
        borderRadius: theme.sizes.radius.sm,
        backgroundColor: SEARCH_FIELD_FILL,
        borderWidth: 0,
        overflow: 'hidden',
    },
    inputClear: {
        position: 'absolute',
        right: theme.sizes.spacing.md,
        top: '50%',
        marginTop: -11,
        zIndex: 2,
    },
    landingEmptyWrap: {
        flexGrow: 1,
        paddingBottom: theme.sizes.spacing.xl,
        backgroundColor: theme.colors.grey[800],
    },
    emptyHero: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: 260,
        paddingVertical: theme.sizes.spacing.lg,
    },
    sectionHdr: {
        marginTop: theme.sizes.spacing.sm,
        marginBottom: theme.sizes.spacing.md,
    },
    pad: {
        paddingHorizontal: theme.sizes.spacing.sm,
        paddingVertical: theme.sizes.spacing.md,
    },
    sectionHeader: {
        paddingTop: theme.sizes.spacing.md,
        paddingBottom: theme.sizes.spacing.sm,
       backgroundColor: theme.colors.grey[900],
    },
    suggestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        paddingVertical: theme.sizes.spacing.base,
        paddingRight: theme.sizes.spacing.xs,
    },
    suggestionLabel: {
        flex: 1,
        paddingRight: theme.sizes.spacing.sm,
    },
    flex1: {
        flex: 1,
    },
    clearPill: {
        alignSelf: 'center',
        marginTop: theme.sizes.spacing.lg,
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: 6,
        borderRadius: theme.sizes.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.grey[50],
        backgroundColor: 'transparent',
    },
    flexGrow: {
        flex: 1,
       // backgroundColor: SEARCH_SCREEN_BG,
    },
    /** Lets catalog ScrollView claim space below suggestion rows (otherwise results can sit off-screen). */
    resultsPane: {
        flex: 1,
        minHeight: 0,
    },
    loadingCenter: {
        flex: 1,
        minHeight: 0,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
    loaderScale: {
        transform: [{ scale: 1.45 }],
    },
    staleBanner: {
        paddingVertical: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.md,
        marginBottom: theme.sizes.spacing.sm,
    },
    searchErrorWrap: {
        flex: 1,
        minHeight: 120,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
    searchErrorText: {
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: theme.sizes.spacing.sm,
        paddingHorizontal: theme.sizes.spacing.lg,
    },
});
