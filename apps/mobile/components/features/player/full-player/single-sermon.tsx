import { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    LayoutChangeEvent,
    Image,
    type ImageSourcePropType,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    type SharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import type { BaseSermonDtoSlimified, SermonItemDTO } from '@/api/dtos/sermon.dto';
import type { Queue } from '@/api/dtos/queue-client.dto';
import { useCurrentTrack, usePlayQueue } from '@/engine/state/player-queue-store';
import { useLoadNewQueue } from '@/engine/hooks/useControl';
import { useNetworkStatus } from '@/lib/state/network-store';
import { networkStatusTypes } from '@/api/dtos/network.dto';
import { QueuingType } from '@/api/types';
import SwipeableRow from '../player/SwipeableRow';
import type { SwipeableRowContextValue } from '../player/swipeable-row-context';
import { RunTimeTicks } from '@/engine/helpers/time-codes';
import { SolidIcons } from '@/assets/icons';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { Notification } from 'iconsax-react-nativejs';

export interface ISermon {
    track: SermonItemDTO; // BaseItemDto
    tracklist?: BaseSermonDtoSlimified[];
    index: number;
    queue: Queue;
    showArtwork?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    isNested?: boolean;
    invertedColors?: boolean;
    prependElement?: React.ReactNode;
    showRemove?: boolean;
    onRemove?: () => void;
    testID?: string;
}

export default function SermonTrack(data: ISermon) {
    const {
        track,
        tracklist,
        index,
        queue,
        showArtwork,
        onPress,
        onLongPress,
        testID,
        isNested,
        prependElement,
        showRemove,
        onRemove,
    } = data;

    const router = useRouter();
    const [artworkWidth, setArtworkWidth] = useState(0);

    const nowPlaying = useCurrentTrack();
    const playQueue = usePlayQueue();
    const loadNewQueue = useLoadNewQueue();
    const [networkStatus] = useNetworkStatus();
    //const offlineAudio = useDownloadedTrack(track.Id);
    //const { data: mediaInfo } = useStreamedMediaInfo(track.Id);

    //   const { mutate: addFavorite } = useAddFavorite();
    //   const { mutate: removeFavorite } = useRemoveFavorite();
    //   const { data: isFavoriteTrack } = useIsFavorite(track);

    const isPlaying = useMemo(
        () => nowPlaying?.item.id === track.id,
        [nowPlaying?.item.id, track.id],
    );
    const isOffline = useMemo(
        () => networkStatus === networkStatusTypes.DISCONNECTED,
        [networkStatus],
    );
    const memoizedTracklist = useMemo(
        () => tracklist ?? playQueue?.map((t) => t.item) ?? [],
        [tracklist, playQueue],
    );

    const handlePress = useCallback(() => {
        if (onPress) return onPress();
        loadNewQueue({
            api: undefined,
            networkStatus: networkStatus ?? networkStatusTypes.ONLINE,
            track,
            index,
            tracklist: memoizedTracklist,
            queue,
            queuingType: QueuingType.FromSelection,
            startPlayback: true,
        });
    }, [onPress, track, index, memoizedTracklist, queue, networkStatus]);

    const handleLongPress = useCallback(() => {
        if (onLongPress) return onLongPress();
        router.push({
            pathname: '/context',
            params: {
                itemId: track.id,
                // streamingInfo: mediaInfo?.MediaSources?.[0],
                // downloadedInfo: offlineAudio?.mediaSourceInfo,
            },
        });
    }, [onLongPress, track]);

    const handleIconPress = useCallback(() => {
        if (showRemove && onRemove) return onRemove();
        router.push({
            pathname: '/context',
            params: {
                itemId: track.id,
                // streamingInfo: mediaInfo?.MediaSources?.[0],
                // downloadedInfo: offlineAudio?.mediaSourceInfo,
            },
        });
    }, [showRemove, onRemove, track]);

    const textColorClass = useMemo(() => {
        if (isPlaying) return 'text-purple-500';
        if (isOffline) return 'text-gray-400';
        return 'text-gray-900';
    }, [isPlaying, isOffline]);

    const artistsText = useMemo(() => {
        const m = track.minister;
        if (m == null) return '';
        if (Array.isArray(m)) return m.join(', ');
        return String(m);
    }, [track.minister]);
    const trackName = useMemo(() => track.title ?? 'Untitled', [track.title]);
    const indexNumber = useMemo(() => track.id?.toString() ?? '', [track.id]);
    const shouldShowArtists = useMemo(
        () =>
            showArtwork ||
            (Array.isArray(track.minister) && track.minister.length > 1),
        [showArtwork, track.minister],
    );

    const swipeConfig = useMemo(() => ({}), []);

    const runtimeComponent = useMemo(
        () => (
            <RunTimeTicks className="text-right min-w-[40px]">
                {track.duration}
            </RunTimeTicks>
        ),
        [track.duration],
    );

    return (
        <SwipeableRow
            disabled={isNested}
            {...swipeConfig}
            onPress={handlePress}
            onLongPress={handleLongPress}
        >
            {(row: SwipeableRowContextValue) => (
                <View
                    className="flex-row items-center p-2 bg-white"
                    testID={testID}
                >
                    {prependElement && (
                        <View className="mr-2">{prependElement}</View>
                    )}

                    <View
                        className="mx-2 items-center justify-center"
                        onLayout={(e: LayoutChangeEvent) =>
                            setArtworkWidth(e.nativeEvent.layout.width)
                        }
                    >
                        {showArtwork ? (
                            <HideableArtwork tx={row.tx}>
                                <SermonRowArtwork track={track} size={48} />
                            </HideableArtwork>
                        ) : (
                            <Text
                                className={`w-12 text-center ${textColorClass}`}
                            >
                                {indexNumber}
                            </Text>
                        )}
                    </View>

                    <SlidingTextArea
                        tx={row.tx}
                        rightWidth={row.rightWidth}
                        leftGapWidth={artworkWidth}
                        hasArtwork={!!showArtwork}
                    >
                        <View className="flex-1 justify-center">
                            <Text
                                className={`font-bold ${textColorClass} truncate`}
                            >
                                {trackName}
                            </Text>
                            {shouldShowArtists && (
                                <Text className="text-gray-400 truncate">
                                    {artistsText}
                                </Text>
                            )}
                        </View>
                    </SlidingTextArea>

                    <View className="flex-row items-center ml-2 space-x-1">
                        <SolidIcons.ArrowsUpDownIcon
                            color="#6b7280"
                            size={20}
                        />
                        <Notification
                            size={20}
                            variant="Outline"
                            color="#6b7280"
                        />
                        {runtimeComponent}
                        <Pressable onPress={handleIconPress}>
                            {showRemove ? (
                                <XMarkIcon size={20} />
                            ) : (
                                <SolidIcons.CreditCardIcon size={20} />
                            )}
                        </Pressable>
                    </View>
                </View>
            )}
        </SwipeableRow>
    );
}

function sermonRowArtworkSource(
    track: SermonItemDTO,
): ImageSourcePropType | null {
    const { image, artwork } = track;
    if (typeof image === 'number') return image;
    if (typeof artwork === 'number') return artwork;
    const uri =
        (typeof image === 'string' && image.length > 0 ? image : null) ??
        (typeof artwork === 'string' && artwork.length > 0 ? artwork : null);
    return uri ? { uri } : null;
}

function SermonRowArtwork({
    track,
    size,
}: {
    track: SermonItemDTO;
    size: number;
}) {
    const source = sermonRowArtworkSource(track);
    if (!source) {
        return (
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: 4,
                    backgroundColor: '#e5e7eb',
                }}
            />
        );
    }
    return (
        <Image
            source={source}
            style={{ width: size, height: size, borderRadius: 4 }}
            accessibilityLabel={track.title ?? 'Artwork'}
        />
    );
}

function HideableArtwork({
    tx,
    children,
}: {
    tx: SharedValue<number>;
    children: React.ReactNode;
}) {
    const style = useAnimatedStyle(() => ({ opacity: tx.value === 0 ? 1 : 0 }));
    return <Animated.View style={style}>{children}</Animated.View>;
}

function SlidingTextArea({
    tx,
    rightWidth,
    leftGapWidth,
    hasArtwork,
    children,
}: {
    tx: SharedValue<number>;
    rightWidth: number;
    leftGapWidth: number;
    hasArtwork: boolean;
    children: React.ReactNode;
}) {
    const style = useAnimatedStyle(() => {
        const t = tx.value;
        let offset = 0;
        if (t > 0 && hasArtwork)
            offset = -Math.min(t, Math.max(0, leftGapWidth));
        else if (t < 0) offset = Math.min(-t, Math.max(0, rightWidth)) * 0.7;
        return { transform: [{ translateX: offset }] };
    });
    return (
        <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>
    );
}
