import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { Add } from 'iconsax-react-nativejs';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { SolidIcons } from '@/assets/icons';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

type PlaybackQueueProps = {
    nowPlaying: SermonItemDTO;
    nextUp: SermonItemDTO[];
    onClose?: () => void;
    onAddToQueue?: () => void;
    onPressNowPlayingMore?: () => void;
    onPressQueueItem?: (item: SermonItemDTO, index: number) => void;
};

const FALLBACK_ART = require('@/assets/images/cover.jpg');

export default function PlaybackQueue({
    nowPlaying,
    nextUp,
    onClose,
    onAddToQueue,
    onPressNowPlayingMore,
    onPressQueueItem,
}: PlaybackQueueProps) {
    return (
        <View style={styles.screen}>
            <View style={styles.topNav}>
                <View style={styles.sheetHandleWrap}>
                    <View style={styles.sheetHandle} />
                </View>

                <View style={styles.headerRow}>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Text
                            size="sm"
                            weight="semiBold"
                            color={theme.colors.white[50]}
                        >
                            Close
                        </Text>
                    </Pressable>

                    <Text
                        size="md"
                        weight="semiBold"
                        color={theme.colors.white[50]}
                    >
                        Playback Queue
                    </Text>

                    <Pressable onPress={onAddToQueue} hitSlop={8}>
                        <Add size={20} color={theme.colors.white[50]} />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <Text
                    size="md"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                >
                    Now Playing
                </Text>
                <QueueRow
                    track={nowPlaying}
                    nowPlaying
                    onPressMore={onPressNowPlayingMore}
                />

                <Text
                    size="md"
                    weight="semiBold"
                    color={theme.colors.white[50]}
                    textStyle={styles.sectionSpacing}
                >
                    Next Up
                </Text>
                {nextUp.map((item, index) => (
                    <QueueRow
                        key={`${item.id ?? item.title ?? 'next'}-${index}`}
                        track={item}
                        onPress={() => onPressQueueItem?.(item, index)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

type QueueRowProps = {
    track: SermonItemDTO;
    nowPlaying?: boolean;
    onPress?: () => void;
    onPressMore?: () => void;
};

function QueueRow({ track, nowPlaying, onPress, onPressMore }: QueueRowProps) {
    return (
        <Pressable style={styles.row} onPress={onPress}>
            <Image source={resolveArtwork(track)} style={styles.art} />
            <View style={styles.trackInfo}>
                <View style={styles.titleRow}>
                    {nowPlaying ? <BroadcastDot /> : null}
                    <Text
                        size="sm"
                        weight="medium"
                        color={
                            nowPlaying
                                ? theme.colors.teal[500]
                                : theme.colors.white[50]
                        }
                        numberOfLines={1}
                    >
                        {track.title ?? 'Untitled'}
                    </Text>
                </View>
                <View style={styles.metaRow}>
                    <Text
                        size="sm"
                        color={theme.colors.grey[200]}
                        numberOfLines={1}
                    >
                        {track.minister ?? 'Unknown minister'}
                    </Text>
                    <View style={styles.dot} />
                    <Text size="sm" color={theme.colors.grey[200]}>
                        {formatDuration(track.duration)}
                    </Text>
                </View>
            </View>

            {nowPlaying ? (
                <Pressable hitSlop={8} onPress={onPressMore}>
                    <SolidIcons.EllipsisVerticalIcon
                        color={theme.colors.grey[50]}
                    />
                </Pressable>
            ) : (
                <View style={styles.dragHandle}>
                    <View style={styles.dragLine} />
                    <View style={styles.dragLine} />
                </View>
            )}
        </Pressable>
    );
}

function BroadcastDot() {
    return (
        <View style={styles.broadcastWrap}>
            <View style={styles.broadcastCenter} />
        </View>
    );
}

function resolveArtwork(track: SermonItemDTO): ImageSourcePropType {
    const art = track.image ?? track.artwork;
    if (typeof art === 'number') return art;
    if (typeof art === 'string' && art.length > 0) return { uri: art };
    return FALLBACK_ART;
}

function formatDuration(duration: number | null | undefined): string {
    if (duration == null || !Number.isFinite(duration) || duration < 0) {
        return '--:--';
    }
    const total = Math.floor(duration);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#171717',
    },
    topNav: {
        paddingBottom: theme.sizes.spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(60,60,67,0.36)',
    },
    sheetHandleWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 22,
    },
    sheetHandle: {
        width: 343,
        height: 6,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: '#5C2B27',
    },
    headerRow: {
        height: 42,
        paddingHorizontal: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    content: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing['2xl'],
        gap: theme.sizes.spacing.sm,
    },
    sectionSpacing: {
        marginTop: theme.sizes.spacing.lg,
    },
    row: {
        height: 66,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
    },
    art: {
        width: 42,
        height: 42,
        borderRadius: 4,
        backgroundColor: theme.colors.grey[700],
    },
    trackInfo: {
        flex: 1,
        minWidth: 0,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.sm,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[200],
    },
    broadcastWrap: {
        width: 14,
        height: 14,
        borderRadius: theme.sizes.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.teal[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    broadcastCenter: {
        width: 4,
        height: 4,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.teal[500],
    },
    dragHandle: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    dragLine: {
        width: 14,
        height: 1.5,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.grey[200],
    },
});
