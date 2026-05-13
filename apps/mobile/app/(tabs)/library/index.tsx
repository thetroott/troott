import { Pressable, RefreshControl, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import ScreenView from '@/components/ui/screenview';
import { ScrollView } from 'react-native-gesture-handler';
import Button from '@/components/ui/button';
import { FlashList } from '@shopify/flash-list';
import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import { OutlineIcons, SolidIcons } from '@/assets/icons';
import {
    BottomSheetModal,
    BottomSheetRef,
} from '@/components/ui/bottom-sheet-modal';
import { Grid1 } from 'iconsax-react-nativejs';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import {
    CategoryItem,
    LibraryHeader,
    SortItem,
} from '@/components/features/library';
import {
    LibraryAllSmartCards,
    LibraryListeningHistory,
    LibraryPlaylistCategory,
    LibraryMinisterCategory,
    LibrarySeriesCategory,
    LibrarySermonCategory,
} from '@/components/features/library/library-category-bodies';
import {
    usePlaylistsQuery,
    useUserLibraryQuery,
} from '@/api/hooks/use-library-queries';
import { useContextType } from '@/state/app-state';
import { getLibraryArrayField } from '@/engine/utils/library-map';

type CategoryKey = 'All' | 'Playlists' | 'Sermon' | 'Series' | 'Minister';

const DEFAULT_SORT: Record<CategoryKey, string> = {
    All: 'Recent Activities',
    Playlists: 'Recently updated',
    Sermon: 'Newest to oldest',
    Series: 'Newest to oldest',
    Minister: 'Most played',
};

const categories = [
    { id: 1, name: 'All' as const, subs: [] as string[] },
    {
        id: 2,
        name: 'Playlists' as const,
        subs: ['All Playlist', 'By You', 'By Troott'],
    },
    { id: 3, name: 'Sermon' as const, subs: ['All Sermons', 'Downloaded'] },
    { id: 4, name: 'Series' as const, subs: ['All Series', 'Downloaded'] },
    { id: 5, name: 'Minister' as const, subs: [] as string[] },
];

const Library = () => {
    const { userContext } = useContextType();
    const userId = (userContext.user as { id?: string } | null)?.id;

    const {
        data: lib,
        isLoading: libLoading,
        refetch: refetchLibrary,
        isRefetching: refetchingLibrary,
    } = useUserLibraryQuery(!!userId);
    const {
        data: playlistApiData,
        refetch: refetchPlaylists,
        isRefetching: refetchingPlaylists,
    } = usePlaylistsQuery(!!userId);

    const sheetRef = React.useRef<BottomSheetRef>(null);
    function openBottomSheet() {
        sheetRef.current?.open();
    }
    const [sortValue, setSortValue] =
        React.useState<string>('Recent Activities');
    const [displayStyle, setDisplayStyle] = React.useState<'grid' | 'list'>(
        'list',
    );
    const [selectedCategory, setSelectedCategory] =
        React.useState<CategoryKey>('All');
    const [subCategories, setSubCategories] = React.useState<string[]>([]);

    const skipCategoryReset = React.useRef(true);
    /** When smart cards jump to a category, apply this sub-filter once (see Downloads tile). */
    const pendingSubCategoryRef = React.useRef<string | null>(null);
    React.useEffect(() => {
        if (skipCategoryReset.current) {
            skipCategoryReset.current = false;
            return;
        }
        const cat = categories.find((c) => c.name === selectedCategory);
        const subs = cat?.subs ?? [];
        setSortValue(DEFAULT_SORT[selectedCategory]);
        const pending = pendingSubCategoryRef.current;
        if (pending != null && subs.includes(pending)) {
            pendingSubCategoryRef.current = null;
            setSubCategories([pending]);
            return;
        }
        setSubCategories(subs.length ? [subs[0]] : []);
    }, [selectedCategory]);

    const applySort = useCallback((value: string) => {
        setSortValue(value);
        sheetRef.current?.close();
    }, []);

    const handleSubCategoryPress = useCallback((sub: string) => {
        setSubCategories([sub]);
    }, []);
    const sortItemsMap: Record<
        CategoryKey,
        { selected?: boolean; onPress?: () => void; name?: string }[]
    > = {
        All: [
            {
                name: 'Recent Activities',
                selected: sortValue === 'Recent Activities',
                onPress: () => applySort('Recent Activities'),
            },
            {
                name: 'Listening History',
                selected: sortValue === 'Listening History',
                onPress: () => applySort('Listening History'),
            },
            {
                name: 'Alphabetical',
                selected: sortValue === 'Alphabetical',
                onPress: () => applySort('Alphabetical'),
            },
        ],
        Playlists: [
            {
                name: 'Recently updated',
                selected: sortValue === 'Recently updated',
                onPress: () => applySort('Recently updated'),
            },
            {
                name: 'Recently added',
                selected: sortValue === 'Recently added',
                onPress: () => applySort('Recently added'),
            },
            {
                name: 'Alphabetical',
                selected: sortValue === 'Alphabetical',
                onPress: () => applySort('Alphabetical'),
            },
        ],
        Sermon: [
            {
                name: 'Newest to oldest',
                selected: sortValue === 'Newest to oldest',
                onPress: () => applySort('Newest to oldest'),
            },
            {
                name: 'Oldest to newest',
                selected: sortValue === 'Oldest to newest',
                onPress: () => applySort('Oldest to newest'),
            },
            {
                name: 'Alphabetical',
                selected: sortValue === 'Alphabetical',
                onPress: () => applySort('Alphabetical'),
            },
            {
                name: 'Most played',
                selected: sortValue === 'Most played',
                onPress: () => applySort('Most played'),
            },
        ],
        Series: [
            {
                name: 'Newest to oldest',
                selected: sortValue === 'Newest to oldest',
                onPress: () => applySort('Newest to oldest'),
            },
            {
                name: 'Oldest to newest',
                selected: sortValue === 'Oldest to newest',
                onPress: () => applySort('Oldest to newest'),
            },
            {
                name: 'Alphabetical',
                selected: sortValue === 'Alphabetical',
                onPress: () => applySort('Alphabetical'),
            },
            {
                name: 'Most played',
                selected: sortValue === 'Most played',
                onPress: () => applySort('Most played'),
            },
        ],
        Minister: [
            {
                name: 'Alphabetical',
                selected: sortValue === 'Alphabetical',
                onPress: () => applySort('Alphabetical'),
            },
            {
                name: 'Most played',
                selected: sortValue === 'Most played',
                onPress: () => applySort('Most played'),
            },
        ],
    };
    function handleFloatingButtonPress() {
        router.push('/playlist/create-playlist');
    }

    const playlistRows = useMemo(() => {
        const data = playlistApiData;
        if (data == null) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object' && data !== null && 'items' in data) {
            const items = (data as { items: unknown }).items;
            return Array.isArray(items) ? items : [];
        }
        return [];
    }, [playlistApiData]);

    const likedCount = useMemo(
        () => getLibraryArrayField(lib, 'likedSermons').length,
        [lib],
    );
    const ministerCount = useMemo(
        () =>
            getLibraryArrayField(
                lib,
                'favouriteMinisters',
                'favouriteministers',
            ).length,
        [lib],
    );
    const playlistCount = playlistRows.length;
    const downloadsCount = useMemo(
        () =>
            getLibraryArrayField(
                lib,
                'downloadedSermons',
                'downloadedsermons',
            ).length,
        [lib],
    );

    const openDownloadsFromSmartCards = useCallback(() => {
        pendingSubCategoryRef.current = 'Downloaded';
        setSelectedCategory('Sermon');
    }, []);

    const onRefresh = useCallback(async () => {
        await Promise.all([refetchLibrary(), refetchPlaylists()]);
    }, [refetchLibrary, refetchPlaylists]);

    const sermonSortForCategory = useMemo(():
        | 'recent'
        | 'alpha'
        | 'oldest'
        | 'plays' => {
        if (selectedCategory === 'Sermon') {
            if (sortValue === 'Alphabetical') return 'alpha';
            if (sortValue === 'Oldest to newest') return 'oldest';
            if (sortValue === 'Most played') return 'plays';
            return 'recent';
        }
        if (selectedCategory === 'All' && sortValue === 'Alphabetical') {
            return 'alpha';
        }
        return 'recent';
    }, [selectedCategory, sortValue]);

    const seriesSortForCategory = useMemo(():
        | 'recent'
        | 'alpha'
        | 'oldest'
        | 'plays' => {
        if (selectedCategory !== 'Series') return 'recent';
        if (sortValue === 'Alphabetical') return 'alpha';
        if (sortValue === 'Oldest to newest') return 'oldest';
        if (sortValue === 'Most played') return 'plays';
        return 'recent';
    }, [selectedCategory, sortValue]);

    const ministerSortForCategory = useMemo((): 'alpha' | 'plays' => {
        if (selectedCategory !== 'Minister') return 'alpha';
        return sortValue === 'Alphabetical' ? 'alpha' : 'plays';
    }, [selectedCategory, sortValue]);

    return (
        <ScreenView>
            <LibraryHeader />
            <ScrollView
                contentContainerStyle={{
                    gap: theme.sizes.spacing.lg,
                }}
                nestedScrollEnabled
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refetchingLibrary || refetchingPlaylists
                        }
                        onRefresh={() => void onRefresh()}
                        tintColor={theme.colors.teal[400]}
                    />
                }
            >
                <FlashList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    renderItem={({ item }) => (
                        <CategoryItem
                            name={item.name}
                            id={item.id}
                            onPress={() => setSelectedCategory(item.name)}
                            selected={item.name === selectedCategory}
                        />
                    )}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: theme.sizes.spacing.md,
                    }}
                >
                    {categories
                        .find((item) => item.name === selectedCategory)
                        ?.subs.map((sub, index) => (
                            <Animated.View key={sub + index}>
                                <Button
                                    variant="secondary"
                                    style={{
                                        marginBottom: theme.sizes.spacing.sm,
                                        backgroundColor: subCategories.includes(
                                            sub,
                                        )
                                            ? theme.colors.teal[500]
                                            : theme.colors.grey[600],
                                        padding: theme.sizes.spacing.sm,
                                        borderRadius: theme.sizes.radius.full,
                                        paddingHorizontal:
                                            theme.sizes.spacing.md,
                                    }}
                                    onPress={() => handleSubCategoryPress(sub)}
                                >
                                    <Text
                                        size="xs"
                                        color={
                                            subCategories.includes(sub)
                                                ? theme.colors.grey[700]
                                                : theme.colors.grey[300]
                                        }
                                    >
                                        {sub}
                                    </Text>
                                </Button>
                            </Animated.View>
                        ))}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Pressable
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.sizes.spacing.sm,
                        }}
                        onPress={openBottomSheet}
                    >
                        <SolidIcons.ArrowsUpDownIcon
                            color={theme.colors.white[50]}
                        />
                        <Text
                            color={theme.colors.white[50]}
                            weight="medium"
                            size="base"
                        >
                            {sortValue}
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setDisplayStyle((prev) =>
                                prev === 'grid' ? 'list' : 'grid',
                            );
                        }}
                    >
                        {displayStyle === 'list' && (
                            <SolidIcons.ListBulletIcon
                                color={theme.colors.white[50]}
                                size={24}
                            />
                        )}
                        {displayStyle === 'grid' && (
                            <Grid1 color={theme.colors.white[50]} size={24} />
                        )}
                    </Pressable>
                </View>

                {selectedCategory === 'All' &&
                    sortValue === 'Recent Activities' && (
                        <LibraryAllSmartCards
                            isGrid={displayStyle === 'grid'}
                            likedCount={likedCount}
                            ministerCount={ministerCount}
                            playlistCount={playlistCount}
                            downloadsCount={downloadsCount}
                            onOpenLiked={() => {
                                setSelectedCategory('Sermon');
                                setSortValue('Newest to oldest');
                            }}
                            onOpenMinisters={() => {
                                setSelectedCategory('Minister');
                                setSortValue('Most played');
                            }}
                            onOpenPlaylists={() => {
                                setSelectedCategory('Playlists');
                                setSortValue('Recently updated');
                            }}
                            onOpenDownloads={openDownloadsFromSmartCards}
                        />
                    )}
                {selectedCategory === 'All' &&
                    sortValue === 'Listening History' && (
                        <LibraryListeningHistory
                            displayStyle={displayStyle}
                        />
                    )}
                {selectedCategory === 'All' &&
                    sortValue === 'Alphabetical' && (
                        <LibrarySermonCategory
                            displayStyle={displayStyle}
                            subCategories={[]}
                            sortMode="alpha"
                        />
                    )}
                {selectedCategory === 'Playlists' && (
                    <LibraryPlaylistCategory
                        displayStyle={displayStyle}
                        subCategories={subCategories}
                        sortValue={sortValue}
                        onOpenLikedSermons={() =>
                            setSelectedCategory('Sermon')
                        }
                    />
                )}
                {selectedCategory === 'Sermon' && (
                    <LibrarySermonCategory
                        displayStyle={displayStyle}
                        subCategories={subCategories}
                        sortMode={sermonSortForCategory}
                    />
                )}
                {selectedCategory === 'Series' && (
                    <LibrarySeriesCategory
                        displayStyle={displayStyle}
                        subCategories={subCategories}
                        sortMode={seriesSortForCategory}
                    />
                )}
                {selectedCategory === 'Minister' && (
                    <LibraryMinisterCategory
                        displayStyle={displayStyle}
                        sortMode={ministerSortForCategory}
                    />
                )}
            </ScrollView>

            <BottomSheetModal.Root ref={sheetRef}>
                <BottomSheetModal.Title>
                    <Text
                        weight="medium"
                        size="base"
                        color={theme.colors.white[50]}
                    >
                        Sort by
                    </Text>
                </BottomSheetModal.Title>
                <BottomSheetModal.Content>
                    <View
                        style={{
                            gap: theme.sizes.spacing.lg,
                            marginTop: theme.sizes.spacing.lg,
                        }}
                    >
                        {(sortItemsMap[selectedCategory] || []).map(
                            (item, index) => (
                                <SortItem {...item} key={index} />
                            ),
                        )}
                    </View>
                </BottomSheetModal.Content>
            </BottomSheetModal.Root>
            <Pressable
                style={{
                    padding: theme.sizes.spacing.md,
                    borderRadius: theme.sizes.radius.sm,
                    backgroundColor: theme.colors.teal[500],
                    position: 'absolute',
                    bottom: 120,
                    right: 20,
                }}
                onPress={handleFloatingButtonPress}
            >
                <OutlineIcons.PlusIcon
                    color={theme.colors.black[50]}
                    size={24}
                />
            </Pressable>
        </ScreenView>
    );
};

export default Library;
