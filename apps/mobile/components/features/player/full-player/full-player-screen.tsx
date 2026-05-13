import React, { useMemo, useEffect } from 'react';
import type { LastPlayedSummary } from '@/engine/state/player-queue-store';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';
import { useTrackStore } from '@/stores/player-store';
import Animated, {
    runOnJS,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { TrackDetailsHeader } from '@/components/features/sermon';
import { useLocalSearchParams } from 'expo-router';
import { useCurrentTrack, useLastPlayed } from '@/stores/player/queue';
import type { ISermonTrack, SermonTrackDTO } from '@/api/dtos/sermon.dto';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { usePlayFromCatalogList } from '@/api/hooks/player/use-play-from-catalog-list';
import { useDismissFullPlayer } from '@/api/hooks/player/use-dismiss-full-player';
import { TrackActionsController } from '@/components/features/player/full-player/components/track-actions-controller';
import { TrackProgress } from '@/components/features/player/full-player/components/track-progress';
import { SermonDetails } from '@/components/features/player/full-player/components/sermon-details';

const FALLBACK_IMAGE = require('@/assets/images/liked.png');

function synthesizeTrackFromLastPlayed(
    lp: LastPlayedSummary | undefined,
): SermonTrackDTO | null {
    if (!lp?.sermonId || !lp.streamUrl) return null;
    return {
        mediaId: lp.sermonId,
        id: lp.sermonId,
        url: lp.streamUrl,
        title: lp.title,
        artist: lp.artist,
        duration: lp.durationSec ?? 0,
        artworkUrl: lp.artworkUrl,
        artwork: lp.artworkUrl,
        item: {
            id: lp.sermonId,
            title: lp.title,
            minister: lp.artist,
            image: lp.artworkUrl ?? null,
            url: lp.streamUrl,
            duration: lp.durationSec,
            sourceType: 'stream',
        },
        sourceType: 'stream',
        sessionId: null,
    } as SermonTrackDTO;
}

/** Resolve track image for display: supports both URI (string) and local require (number). */
function getTrackImageSource(
    track: SermonTrackDTO | { image?: unknown; artwork?: unknown } | null,
): ImageSourcePropType {
    if (!track) return FALLBACK_IMAGE;
    const fromDto = track as SermonTrackDTO;
    const extra = track as { artworkUrl?: string | number | null };
    const raw =
        fromDto.artwork ??
        extra.artworkUrl ??
        fromDto.item?.image ??
        (track as { image?: unknown }).image ??
        (track as { artwork?: unknown }).artwork;
    if (raw == null) return FALLBACK_IMAGE;
    if (typeof raw === 'number') return raw as ImageSourcePropType;
    if (typeof raw === 'string' && raw.length > 0) return { uri: raw };
    return FALLBACK_IMAGE;
}

const DISMISS_DRAG_THRESHOLD = 100;
const DISMISS_VELOCITY = 700;
const DISMISS_SLIDE_MS = 260;

export type FullPlayerTrackDetailsProps = {
    /**
     * When true, only render the in-tab overlay if the user opened the full player.
     * Prevents persisted `lastPlayed` alone from covering the screen after login.
     */
    embedInTabsShell?: boolean;
};

const FullPlayerScreen: React.FC<FullPlayerTrackDetailsProps> = ({
    embedInTabsShell = false,
}) => {
    const { id } = useLocalSearchParams();
    const routeSermonId = useMemo(() => {
        const raw = Array.isArray(id) ? id[0] : id;
        if (raw === undefined || raw === null) return '';
        return String(raw).trim();
    }, [id]);
    const showFullPlayer = useTrackStore((state) => state.showFullPlayer);
    const currentTrack = useCurrentTrack();
    const lastPlayed = useLastPlayed();
    const { data: sermons, isLoading } = useSermonsCatalog();
    const playFromCatalog = usePlayFromCatalogList('Library');
    const dismiss = useDismissFullPlayer();
    const screenH = theme.sizes.screen.height;

    const translateY = useSharedValue(0);
    const panStartTranslateY = useSharedValue(0);

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const dragToCloseGesture = useMemo(
        () =>
            Gesture.Pan()
                .runOnJS(true)
                .activeOffsetY(12)
                .failOffsetX([-56, 56])
                .onStart(() => {
                    panStartTranslateY.value = translateY.value;
                })
                .onUpdate((e) => {
                    const next = panStartTranslateY.value + e.translationY;
                    translateY.value = next > 0 ? next : 0;
                })
                .onEnd((e) => {
                    const shouldClose =
                        translateY.value > DISMISS_DRAG_THRESHOLD ||
                        e.velocityY > DISMISS_VELOCITY;
                    if (shouldClose) {
                        translateY.value = withTiming(
                            screenH,
                            { duration: DISMISS_SLIDE_MS },
                            (finished) => {
                                if (finished) runOnJS(dismiss)();
                            },
                        );
                    } else {
                        translateY.value = withSpring(0, {
                            damping: 28,
                            stiffness: 280,
                        });
                    }
                }),
        [dismiss, panStartTranslateY, screenH, translateY],
    );

    useEffect(() => {
        if (!showFullPlayer) {
            translateY.value = 0;
        }
    }, [showFullPlayer, translateY]);

    const uiTrack = useMemo(
        () => currentTrack ?? synthesizeTrackFromLastPlayed(lastPlayed),
        [currentTrack, lastPlayed],
    );

    const heroImageSource = useMemo((): ImageSourcePropType => {
        const base = getTrackImageSource(uiTrack ?? null);
        if (base !== FALLBACK_IMAGE) return base;
        const sid =
            uiTrack?.item?.id != null ? String(uiTrack.item.id) : routeSermonId;
        const list = sermons as ISermonTrack[] | undefined;
        if (!sid || !list?.length) return base;
        const row = list.find((s) => String(s.id ?? '') === sid);
        const img = row?.image;
        if (img == null) return base;
        if (typeof img === 'number') return img;
        if (typeof img === 'string' && img.length > 0) return { uri: img };
        return base;
    }, [uiTrack, sermons, routeSermonId]);

    useEffect(() => {
        if (!routeSermonId || !sermons?.length || isLoading) return;
        const currentId =
            currentTrack?.item?.id != null ? String(currentTrack.item.id) : '';
        if (currentId === routeSermonId) return;
        const idx = sermons.findIndex(
            (s) => String(s.id ?? '') === routeSermonId,
        );
        if (idx >= 0) void playFromCatalog(sermons, idx);
    }, [
        routeSermonId,
        sermons,
        isLoading,
        currentTrack?.item?.id,
        playFromCatalog,
    ]);

    if (embedInTabsShell) {
        if (!showFullPlayer) return null;
    } else if (!showFullPlayer && !routeSermonId && !lastPlayed?.sermonId) {
        return null;
    }

    if (!uiTrack && !routeSermonId && !isLoading && !lastPlayed?.sermonId) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                sheetAnimatedStyle,
                ...(showFullPlayer ? [] : [{ position: 'absolute' as const }]),
            ]}
            entering={SlideInDown.duration(500)}
        >
            <GestureDetector gesture={dragToCloseGesture}>
                <View
                    style={styles.dragAndHero}
                    collapsable={false}
                    accessibilityLabel="Player. Drag down to close"
                >
                    <TrackDetailsHeader />
                    <Image
                        source={heroImageSource}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            </GestureDetector>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces
                keyboardShouldPersistTaps="handled"
            >
                <TrackActionsController track={uiTrack ?? null} />
                <TrackProgress />
                <SermonDetails
                    track={uiTrack ?? null}
                    catalog={(sermons as ISermonTrack[] | undefined) ?? undefined}
                    getTrackImageSource={getTrackImageSource}
                />
            </Animated.ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        zIndex: 100,
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: theme.sizes.spacing.base,
    },
    scrollContent: {
        gap: theme.sizes.spacing.xl,
        paddingBottom: theme.sizes.spacing['2xl'],
    },
    dragAndHero: {
        gap: theme.sizes.spacing.sm,
        marginBottom: theme.sizes.spacing.md,
    },
    image: {
        height: theme.sizes.screen.height * 0.4,
        borderRadius: theme.sizes.radius.md,
        width: '100%',
    },
});

export default FullPlayerScreen;
