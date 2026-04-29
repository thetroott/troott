import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
    Image,
    type ImageSourcePropType,
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '@/components/ui/text';
import { getToastBottomAboveMiniPlayer } from '@/components/features/player/mini-player/mini-player-layout';
import { theme } from '@/constants/theme';
import { Portal } from '@/components/ui/portal';
import { SolidIcons } from '@/assets/icons';
import {
    BottomSheetModal,
    BottomSheetRef,
} from '@/components/ui/bottom-sheet-modal';
import AddToPlaylistBottomSheet from '@/components/features/playlist/add-to-playlist-bottom-sheet';
import AddToPlaylistConfirmationBar from '@/components/features/playlist/add-to-playlist-confirmation-bar';
import {
    ADD_TO_PLAYLIST_TOAST_MS,
    type SermonAddedToPlaylistInfo,
} from '@/components/features/playlist/use-add-to-playlist';
import { getTrackListActions } from '@/components/features/player/controls/actions';
import type { BaseSermonDtoSlimified, SermonItemDTO } from '@/types/sermon';
import type { Queue } from '@/types/queue-ref';
import { usePlayQueue } from '@/stores/player/queue';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/stores/app/network';
import { networkStatusTypes } from '@/types/network-status';
import { QueuingType } from '@/utils/enums.util';

export type SermonCardVariant = 'small' | 'large';

export interface SermonCardProps {
    track: SermonItemDTO;
    /** Index of this row within the list passed to `tracklist` (or play queue). */
    index: number;
    tracklist?: BaseSermonDtoSlimified[];
    /** Queue label for analytics / engine; defaults to `Search` for ad-hoc lists. */
    queue?: Queue;
    variant?: SermonCardVariant;
    cardStyle?: StyleProp<ViewStyle>;
    testID?: string;
}

function artworkSource(track: SermonItemDTO): ImageSourcePropType | null {
    const { image, artwork } = track;
    if (typeof image === 'number') return image;
    if (typeof artwork === 'number') return artwork;
    const uri =
        (typeof image === 'string' && image.length > 0 ? image : null) ??
        (typeof artwork === 'string' && artwork.length > 0 ? artwork : null);
    return uri ? { uri } : null;
}

function formatDurationSeconds(total: number | null | undefined): string {
    if (total == null || !Number.isFinite(total) || total < 0) {
        return '--:--';
    }
    const sec = Math.floor(total % 60);
    const min = Math.floor(total / 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function ministerLabel(track: SermonItemDTO): string {
    const m = track.minister;
    if (m == null) return '';
    if (Array.isArray(m)) return m.join(', ');
    return String(m);
}

export default function SermonCard({
    track,
    index,
    tracklist,
    queue = 'Search',
    variant = 'small',
    cardStyle,
    testID,
}: SermonCardProps) {
    const sheetRef = useRef<BottomSheetRef>(null);
    const addToPlaylistRef = useRef<BottomSheetRef>(null);
    const insets = useSafeAreaInsets();
    const [sermonAddedToast, setSermonAddedToast] =
        useState<SermonAddedToPlaylistInfo | null>(null);
    const playQueue = usePlayQueue();
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();

    const source = useMemo(() => artworkSource(track), [track]);
    const title = track.title ?? 'Untitled';
    const minister = useMemo(() => ministerLabel(track), [track]);
    const durationLabel = useMemo(
        () => formatDurationSeconds(track.duration ?? null),
        [track.duration],
    );

    const memoizedTracklist = useMemo(
        () => tracklist ?? playQueue?.map((t) => t.item) ?? [],
        [tracklist, playQueue],
    );

    const handlePress = useCallback(() => {
        if (track.id == null) return;
        void loadNewQueue({
            api: undefined,
            networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
            track,
            index,
            tracklist: memoizedTracklist,
            queue,
            queuingType: QueuingType.FromSelection,
            startPlayback: true,
        });
    }, [
        loadNewQueue,
        networkStatus,
        track,
        index,
        memoizedTracklist,
        queue,
    ]);

    const handleSheetOpen = useCallback(() => {
        sheetRef.current?.open();
    }, []);
    useEffect(() => {
        if (!sermonAddedToast) {
            return;
        }
        const t = setTimeout(
            () => setSermonAddedToast(null),
            ADD_TO_PLAYLIST_TOAST_MS,
        );
        return () => clearTimeout(t);
    }, [sermonAddedToast]);

    const onSermonAddedToPlaylist = useCallback(
        (info: SermonAddedToPlaylistInfo) => {
            addToPlaylistRef.current?.close();
            setTimeout(() => {
                setSermonAddedToast(info);
            }, 300);
        },
        [],
    );

    const openAddToPlaylistSheet = useCallback(() => {
        setSermonAddedToast(null);
        sheetRef.current?.close();
        setTimeout(() => {
            addToPlaylistRef.current?.open();
        }, 300);
    }, []);
    const trackListActions = useMemo(
        () =>
            getTrackListActions(track, {
                onOpenAddToPlaylist: openAddToPlaylistSheet,
            }),
        [track, openAddToPlaylistSheet],
    );

    const imageEl = useMemo(() => {
        if (!source) {
            return (
                <View
                    style={
                        variant === 'large'
                            ? styles.imageLargePlaceholder
                            : styles.imageSmallPlaceholder
                    }
                />
            );
        }
        return (
            <Image
                style={variant === 'large' ? styles.imageLarge : styles.imageSmall}
                source={source}
                accessibilityLabel={title}
            />
        );
    }, [source, variant, title]);

    const toastBottom = getToastBottomAboveMiniPlayer(insets.bottom, {
        isMainTabs: true,
    });

    return (
        <View testID={testID}>
            {sermonAddedToast ? (
                <Portal
                    name={`sermon-playlist-toast-${String(track.id ?? 'unknown')}`}
                >
                    <View
                        style={styles.portalToastRoot}
                        pointerEvents="box-none"
                    >
                        <View
                            style={[
                                styles.sermonAddedToastSheet,
                                { bottom: toastBottom },
                            ]}
                        >
                            <AddToPlaylistConfirmationBar
                                playlistName={sermonAddedToast.name}
                                onView={() => {
                                    const { playlistId } = sermonAddedToast;
                                    setSermonAddedToast(null);
                                    router.push(
                                        `/playlist/${playlistId}`,
                                    );
                                }}
                            />
                        </View>
                    </View>
                </Portal>
            ) : null}
            {variant === 'large' && (
                <Pressable
                    style={[styles.largeContainer, cardStyle]}
                    onPress={handlePress}
                    disabled={track.id == null}
                >
                    {imageEl}
                    <View style={{ gap: theme.sizes.spacing.sm }}>
                        <Text size="sm" color={theme.colors.white[50]}>
                            {title}
                        </Text>
                        <View style={styles.textContainer}>
                            <Text size="xs" textStyle={{ alignItems: 'center' }}>
                                {minister}
                            </Text>
                            <View style={styles.dot} />
                            <Text>{durationLabel}</Text>
                        </View>
                    </View>
                </Pressable>
            )}

            {variant === 'small' && (
                <Pressable
                    style={[styles.container, cardStyle]}
                    onPress={handlePress}
                    disabled={track.id == null}
                >
                    <View style={styles.titleContainer}>
                        {imageEl}
                        <View style={{ gap: theme.sizes.spacing.sm, width: '60%' }}>
                            <Text size="base" color={theme.colors.white[50]}>
                                {title}
                            </Text>
                            <View style={styles.textContainer}>
                                <Text textStyle={{ alignItems: 'center' }}>
                                    {minister}
                                </Text>
                                <View style={styles.dot} />
                                <Text>{durationLabel}</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable onPress={handleSheetOpen} hitSlop={8}>
                        <SolidIcons.EllipsisVerticalIcon
                            color={theme.colors.grey[50]}
                        />
                    </Pressable>
                </Pressable>
            )}

            <BottomSheetModal.Root ref={sheetRef}>
                <BottomSheetModal.Title>
                    <View>
                        <View style={styles.titleContainer}>
                            {imageEl}
                            <View
                                style={{ gap: theme.sizes.spacing.sm, width: '60%' }}
                            >
                                <Text size="base" color={theme.colors.white[50]}>
                                    {title}
                                </Text>
                                <View style={styles.textContainer}>
                                    <Text textStyle={{ alignItems: 'center' }}>
                                        {minister}
                                    </Text>
                                    <View style={styles.dot} />
                                    <Text>{durationLabel}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </BottomSheetModal.Title>
                <BottomSheetModal.Content>
                    {trackListActions.map((action, i) => (
                        <Pressable
                            key={`${action.label}-${i}`}
                            style={styles.sheetRow}
                            onPress={() => {
                                action.action?.();
                                sheetRef.current?.close();
                            }}
                        >
                            {action.icon}
                            <Text color="white" size="sm">
                                {action.label}
                            </Text>
                        </Pressable>
                    ))}
                </BottomSheetModal.Content>
            </BottomSheetModal.Root>
            <AddToPlaylistBottomSheet
                ref={addToPlaylistRef}
                onSermonAddedToPlaylist={onSermonAddedToPlaylist}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    portalToastRoot: {
        ...StyleSheet.absoluteFillObject,
    },
    sermonAddedToastSheet: {
        position: 'absolute',
        left: theme.sizes.spacing.md,
        right: theme.sizes.spacing.md,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: theme.sizes.spacing.base,
        borderBottomWidth: 1,
        borderColor: theme.colors.grey[600],
        width: theme.sizes.screen.width * 0.8,
    },
    imageSmall: {
        height: 64,
        width: 64,
        borderRadius: theme.sizes.radius.sm,
    },
    imageSmallPlaceholder: {
        height: 64,
        width: 64,
        borderRadius: theme.sizes.radius.sm,
        backgroundColor: theme.colors.grey[700],
    },
    titleContainer: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
        alignItems: 'center',
    },
    dot: {
        height: 4,
        width: 4,
        backgroundColor: theme.colors.grey[300],
        borderRadius: theme.sizes.radius.full,
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    imageLarge: {
        width: '100%',
        height: theme.sizes.screen.height * 0.2,
        borderRadius: theme.sizes.radius.base,
    },
    imageLargePlaceholder: {
        width: '100%',
        height: theme.sizes.screen.height * 0.2,
        borderRadius: theme.sizes.radius.base,
        backgroundColor: theme.colors.grey[700],
    },
    largeContainer: {
        gap: theme.sizes.spacing.base,
    },
    sheetRow: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.md,
        alignItems: 'center',
    },
});
