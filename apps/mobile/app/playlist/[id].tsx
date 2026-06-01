import React, { useCallback, useMemo } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { ArrowLeft, Trash } from 'iconsax-react-nativejs';
import { router, useLocalSearchParams } from 'expo-router';

import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import Button from '@/components/ui/button';
import { theme } from '@/constants/theme';
import { SolidIcons } from '@/assets/icons';
import SermonCard from '@/components/features/search/sermon-card';
import {
    LibraryEmptyState,
    LibraryErrorState,
    LibraryListSkeleton,
} from '@/components/features/library/library-states';
import {
    useDeletePlaylistMutation,
    usePlaylistByIdQuery,
    useRemovePlaylistItemMutation,
} from '@/api/hooks/app/usePlaylist';
import { usePlayFromCatalogList } from '@/engine/playback/use-play-from-catalog-list';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import { toast } from '@/components/ui/toast';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

const FALLBACK_COVER = require('@/assets/images/cover.jpg');

function resolveCover(banner?: string | null): ImageSourcePropType {
    if (banner && banner.length > 0) return { uri: banner };
    return FALLBACK_COVER;
}

function offlineBlocked(): boolean {
    toast.error('You are offline. Connect to continue.');
    return true;
}

export default function PlaylistScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const playlistId = String(id ?? '');

    const {
        data: playlist,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = usePlaylistByIdQuery(playlistId, playlistId.length > 0);

    const sermons = useMemo((): SermonItemDTO[] => {
        if (!playlist?.items?.length) {
            return [];
        }
        return [...playlist.items]
            .sort((a, b) => a.position - b.position)
            .map((row) => ({
                id: row.item.id,
                title: row.item.title,
                minister: row.item.minister ?? '',
                image: row.item.imageUrl ?? null,
                artwork: row.item.imageUrl ?? null,
                duration: row.item.duration ?? null,
                sourceType: row.itemType,
            }));
    }, [playlist]);

    const playFromCatalog = usePlayFromCatalogList('Library');
    const removeItem = useRemovePlaylistItemMutation();
    const deletePlaylist = useDeletePlaylistMutation();
    const [networkStatus] = useNetworkStatus();
    const isOffline = networkStatus === networkStatusTypes.DISCONNECTED;

    const isProtected = useMemo(() => {
        if (!playlist) {
            return false;
        }
        const type = String(playlist.playlistType ?? '').toLowerCase();
        const owner = String(playlist.ownerType ?? '').toLowerCase();
        if (type === 'system' || owner === 'system') {
            return true;
        }
        const title = String(playlist.title ?? '').toLowerCase();
        return title.includes('favourites') || title.includes('favorites');
    }, [playlist]);

    const catalogRows = useMemo(
        () =>
            sermons.map((s, i) => ({
                id: s.id != null ? String(s.id) : `pl-${i}`,
                title: s.title ?? '',
                minister: s.minister ?? '',
                image: s.image ?? s.artwork ?? null,
                url: s.url ?? null,
                duration: s.duration ?? null,
            })),
        [sermons],
    );

    const onPlayAll = useCallback(() => {
        if (isOffline) {
            offlineBlocked();
            return;
        }
        if (catalogRows.length === 0) return;
        void playFromCatalog(catalogRows, 0);
    }, [catalogRows, isOffline, playFromCatalog]);

    const confirmRemove = useCallback(
        (sermon: SermonItemDTO) => {
            if (!playlist || sermon.id == null) return;
            if (isOffline) {
                offlineBlocked();
                return;
            }
            Alert.alert(
                'Remove from playlist',
                `Remove "${sermon.title ?? 'this sermon'}" from ${playlist.title}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            void removeItem
                                .mutateAsync({
                                    playlistId: playlist.id,
                                    payload: { itemId: String(sermon.id) },
                                })
                                .then(() => {
                                    toast.success('Removed from playlist');
                                })
                                .catch((e: unknown) => {
                                    const msg =
                                        e instanceof Error
                                            ? e.message
                                            : 'Could not remove sermon';
                                    toast.error(msg);
                                });
                        },
                    },
                ],
            );
        },
        [isOffline, playlist, removeItem],
    );

    const confirmDeletePlaylist = useCallback(() => {
        if (!playlist || isProtected) return;
        if (isOffline) {
            offlineBlocked();
            return;
        }
        Alert.alert(
            'Delete playlist',
            `Delete "${playlist.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        void deletePlaylist
                            .mutateAsync(playlist.id)
                            .then(() => {
                                toast.success('Playlist deleted');
                                router.back();
                            })
                            .catch((e: unknown) => {
                                const msg =
                                    e instanceof Error
                                        ? e.message
                                        : 'Could not delete playlist';
                                toast.error(msg);
                            });
                    },
                },
            ],
        );
    }, [deletePlaylist, isOffline, isProtected, playlist]);

    if (!playlistId) {
        return (
            <ScreenView>
                <LibraryEmptyState
                    title="Playlist not found"
                    subtitle="Go back and pick another playlist."
                    actionLabel="Back to Library"
                    onAction={() => router.replace('/library')}
                />
            </ScreenView>
        );
    }

    if (isLoading && !playlist) {
        return (
            <ScreenView>
                <LibraryListSkeleton />
            </ScreenView>
        );
    }

    if (isError && !playlist) {
        return (
            <ScreenView>
                <LibraryErrorState
                    message="Could not load this playlist."
                    onRetry={() => void refetch()}
                />
            </ScreenView>
        );
    }

    if (!playlist) {
        return (
            <ScreenView>
                <LibraryEmptyState
                    title="Playlist not found"
                    subtitle="It may have been removed or you may not have access."
                    actionLabel="Back to Library"
                    onAction={() => router.replace('/library')}
                />
            </ScreenView>
        );
    }

    const countLabel =
        sermons.length === 1 ? '1 sermon' : `${sermons.length} sermons`;

    return (
        <ScreenView>
            <View style={styles.navRow}>
                <Pressable
                    style={styles.backRow}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    hitSlop={8}
                >
                    <ArrowLeft size={22} color={theme.colors.teal[400]} />
                    <Text size="sm" weight="medium" color={theme.colors.teal[400]}>
                        Library
                    </Text>
                </Pressable>
                {!isProtected ? (
                    <Pressable
                        onPress={confirmDeletePlaylist}
                        accessibilityRole="button"
                        accessibilityLabel="Delete playlist"
                        hitSlop={8}
                    >
                        <Trash size={22} color={theme.colors.grey[300]} />
                    </Pressable>
                ) : null}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.body}
            >
                <View style={styles.hero}>
                    <Image
                        source={resolveCover(playlist.banner)}
                        style={styles.cover}
                        accessibilityIgnoresInvertColors
                    />
                    <View style={styles.heroText}>
                        <Text
                            weight="semiBold"
                            size="2xl"
                            color={theme.colors.white[50]}
                            numberOfLines={2}
                        >
                            {playlist.title}
                        </Text>
                        {playlist.description ? (
                            <Text
                                size="sm"
                                color={theme.colors.grey[300]}
                                numberOfLines={3}
                            >
                                {playlist.description}
                            </Text>
                        ) : null}
                        <Text size="sm" color={theme.colors.grey[400]}>
                            {countLabel}
                        </Text>
                        {isProtected ? (
                            <Text size="xs" color={theme.colors.grey[500]}>
                                This is a system playlist and cannot be deleted.
                            </Text>
                        ) : null}
                        <Button
                            leftIcon={
                                <SolidIcons.PlayIcon
                                    color={theme.colors.grey[50]}
                                    size={18}
                                />
                            }
                            label="Play all"
                            onPress={onPlayAll}
                            disabled={sermons.length === 0 || isOffline}
                            containerStyle={styles.playAllButton}
                            variant="ghost"
                        />
                    </View>
                </View>

                {isRefetching ? (
                    <Text size="xs" color={theme.colors.grey[500]}>
                        Updating…
                    </Text>
                ) : null}

                {sermons.length === 0 ? (
                    <LibraryEmptyState
                        title="No sermons yet"
                        subtitle="Save sermons from search or the player to build this playlist."
                        actionLabel="Search sermons"
                        actionFilled
                        onAction={() => router.push('/search/query')}
                    />
                ) : (
                    <View style={styles.trackList}>
                        {sermons.map((item, index) => (
                            <View key={item.id ?? `pl-item-${index}`}>
                                <SermonCard
                                    track={item}
                                    index={index}
                                    tracklist={sermons}
                                    queue="Library"
                                    variant="small"
                                    cardStyle={styles.sermonCard}
                                />
                                {!isProtected ? (
                                    <Pressable
                                        style={styles.removeRow}
                                        onPress={() => confirmRemove(item)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Remove from playlist"
                                    >
                                        <Text
                                            size="xs"
                                            color={theme.colors.grey[400]}
                                        >
                                            Remove from playlist
                                        </Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </ScreenView>
    );
}

const styles = StyleSheet.create({
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.sizes.spacing.md,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.xs,
    },
    body: {
        paddingBottom: 120,
        gap: theme.sizes.spacing.lg,
    },
    hero: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
    },
    cover: {
        width: 112,
        height: 112,
        borderRadius: theme.sizes.radius.md,
        backgroundColor: theme.colors.grey[700],
    },
    heroText: {
        flex: 1,
        gap: theme.sizes.spacing.sm,
        minWidth: 0,
    },
    playAllButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        borderRadius: theme.sizes.radius.full,
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        backgroundColor: theme.colors.grey[700],
        minHeight: 40,
    },
    trackList: {
        gap: theme.sizes.spacing.xs,
    },
    sermonCard: {
        width: '100%',
        borderBottomWidth: 0,
    },
    removeRow: {
        alignSelf: 'flex-end',
        paddingVertical: theme.sizes.spacing.xs,
        paddingHorizontal: theme.sizes.spacing.sm,
    },
});
