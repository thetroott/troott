import { OutlineIcons, SolidIcons } from '@/assets/icons';
import { MINIPLAYER_UPDATE_INTERVAL } from '@/engine/constants/engine';
import { useProgress } from '@/engine/queries/playback-queries';
import { usePrevious, useSkip } from '@/engine/hooks/useControl';
import {
    useCurrentIndex,
    useCurrentTrack,
    useLastPlayed,
    usePlayQueue,
} from '@/engine/state/player-queue-store';
import { colors } from '@/constants/colors';
import { sizes } from '@/constants/sizes';
import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { useCallback, useMemo, memo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import type { LastPlayedSummary } from '@/engine/state/player-queue-store';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';
import type { SermonTrackDTO } from '@/api/dtos/sermon.dto';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '@/components/ui/text';
import { useIsNowPlayingStackRouteFocused } from '@/engine/playback/now-playing-route';
import PlayPauseButton from '@/components/features/player/controls/play-pause';
import { Next } from 'iconsax-react-nativejs';
import { useTrackStore } from '@/engine/state/player-ui-store';
import {
    useIsSermonFavorite,
    useToggleFavoriteWithSync,
} from '@/api/hooks/app/useFavorites';
import { useResumeLastPlayed } from '@/engine/playback/use-resume-last-played';
import { useCanSkipNext } from '@/engine/playback/use-can-skip-next';
import { MINI_PLAYER_BOTTOM_OFFSET_BASE } from '@/components/features/player/mini-player/mini-player-layout';

const AUTH_PUBLIC_PATHS = new Set([
    '/',
    '/login',
    '/register',
    '/enter-email',
    '/verify-email',
    '/activate-user-account',
    '/reset-password-otp-request',
    '/request-password-otp',
    '/reset-password',
]);

const MINI_PLAYER_MAIN_TAB_NAMES = new Set([
    'home',
    'search',
    'explore',
    'library',
    'profile',
]);

const ONBOARDING_OR_PRE_SHELL_PATHS = new Set([
    '/select-ministers',
    '/select-interests',
]);

function normalizeShellPath(pathname: string): string {
    const base = (pathname.split('?')[0] ?? '').replace(/\/$/, '');
    return base || '/';
}

function isAuthPublicPath(pathname: string): boolean {
    const path = normalizeShellPath(pathname);
    if (AUTH_PUBLIC_PATHS.has(path)) {
        return true;
    }
    return path.startsWith('/(auth)');
}

function isMiniPlayerBlockedPath(pathOnly: string): boolean {
    return (
        pathOnly === '/user/edit-profile' ||
        pathOnly === '/user/photo-picker' ||
        pathOnly === '/user/edit-profile-saved' ||
        pathOnly === '/playlist/create-playlist' ||
        pathOnly.startsWith('/see-more') ||
        pathOnly === '/minister' ||
        pathOnly.startsWith('/minister/')
    );
}

function shouldAllowMiniPlayer(
    pathname: string,
    segments: readonly string[],
): boolean {
    if (segments.includes('(auth)') || segments.includes('(onboarding)')) {
        return false;
    }

    const base = normalizeShellPath(pathname);
    if (base === '/' || base === '') return false;
    if (isAuthPublicPath(base)) return false;
    if (ONBOARDING_OR_PRE_SHELL_PATHS.has(base)) return false;
    if (segments.length === 1 && segments[0] === 'index') return false;
    if (isMiniPlayerBlockedPath(base)) return false;

    return true;
}

function shouldHideMiniPlayerForFullPlayerRoute(
    pathname: string,
    segments: readonly string[],
): boolean {
    const base = pathname.split('?')[0] ?? '';
    const baseNorm = base.replace(/\/$/, '') || '/';
    if (segments.includes('player')) return true;
    if (baseNorm === '/player' || base.startsWith('/player/')) return true;
    if (baseNorm.includes('/player') || segments.some((s) => s === 'player')) {
        return true;
    }
    return false;
}

function isMainTabsShell(
    pathname: string,
    segments: readonly string[],
): boolean {
    if (segments.includes('(tabs)')) return true;

    const last = segments.length > 0 ? segments[segments.length - 1] : '';
    if (typeof last === 'string' && MINI_PLAYER_MAIN_TAB_NAMES.has(last)) {
        return true;
    }

    const p = pathname.split('?')[0] ?? '';
    if (
        MINI_PLAYER_MAIN_TAB_NAMES.has(
            p.replace(/^\//, '').split('/').pop() ?? '',
        )
    ) {
        return true;
    }

    return /\(tabs\)\/(home|search|explore|library|profile)(\/|$)/.test(p);
}

const FALLBACK_ART = require('@/assets/images/liked.png');

const ARTWORK = 35;
const BAR_MIN_HEIGHT = 54;
const PROGRESS_HEIGHT = 2;
const ICON_SIZE = 24;

function miniPlayerArtSource(
    nowPlaying: SermonTrackDTO | undefined,
): ImageSourcePropType {
    const raw =
        nowPlaying?.artwork ??
        nowPlaying?.artworkUrl ??
        nowPlaying?.item?.image;
    if (raw == null) return FALLBACK_ART;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string' && raw.length > 0) return { uri: raw };
    return FALLBACK_ART;
}

function displayArtwork(
    track: SermonTrackDTO | undefined,
    lastPlayed: LastPlayedSummary | undefined,
): ImageSourcePropType {
    if (track) return miniPlayerArtSource(track);
    if (lastPlayed?.artworkUrl) return { uri: lastPlayed.artworkUrl };
    return FALLBACK_ART;
}

function displayTitles(
    track: SermonTrackDTO | undefined,
    lastPlayed: LastPlayedSummary | undefined,
) {
    if (track) {
        const item = track.item as SermonItemDTO | undefined;
        return {
            title: track.title ?? item?.title ?? '',
            artist: track.artist ?? item?.minister ?? '',
        };
    }
    if (lastPlayed?.sermonId) {
        return { title: lastPlayed.title, artist: lastPlayed.artist };
    }
    return { title: '', artist: '' };
}

function resolveSermonId(
    track: SermonTrackDTO | undefined,
    lastPlayed: LastPlayedSummary | undefined,
): string {
    if (track?.item?.id != null) return String(track.item.id);
    if (track?.mediaId) return String(track.mediaId);
    if (lastPlayed?.sermonId) return lastPlayed.sermonId;
    return '';
}

const MiniPlayer = () => {
    const currentTrack = useCurrentTrack();
    const queue = usePlayQueue();
    const currentIndex = useCurrentIndex();
    const lastPlayed = useLastPlayed();
    const skip = useSkip();
    const previous = usePrevious();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const setShowFullPlayer = useTrackStore((s) => s.setShowFullPlayer);
    const showFullPlayer = useTrackStore((s) => s.showFullPlayer);
    const setFullPlayerReturnPath = useTrackStore(
        (s) => s.setFullPlayerReturnPath,
    );
    const pathname = usePathname();
    const segments = useSegments();
    const nowPlayingRouteFocused = useIsNowPlayingStackRouteFocused();
    const { toggle: toggleFavoriteId } = useToggleFavoriteWithSync();
    const resumeLastPlayed = useResumeLastPlayed();

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    /** Hide while `/player` modal is up: pathname can lag; `showFullPlayer` + nav state must agree. */
    const hideForFullPlayer =
        shouldHideMiniPlayerForFullPlayerRoute(pathname, segments) ||
        showFullPlayer ||
        nowPlayingRouteFocused;
    const allowInAppShell = shouldAllowMiniPlayer(pathname, segments);
    const aboveMainTabs = isMainTabsShell(pathname, segments);
    const bottomOffset =
        (aboveMainTabs ? MINI_PLAYER_BOTTOM_OFFSET_BASE : 0) + insets.bottom;

    const queueFallback =
        currentIndex != null && currentIndex >= 0 && currentIndex < queue.length
            ? queue[currentIndex]
            : undefined;
    const displayTrack = currentTrack ?? queueFallback;
    const lastPlayedOnly = !displayTrack && Boolean(lastPlayed?.sermonId);
    const visible = Boolean(
        displayTrack ?? (lastPlayed?.sermonId && lastPlayed?.streamUrl),
    );

    const canSkipNext = useCanSkipNext();

    const sermonId = resolveSermonId(displayTrack, lastPlayed);
    const isFavorite = useIsSermonFavorite(sermonId);

    const staticFromLastPlayedForProgress = useMemo(
        () =>
            lastPlayedOnly && lastPlayed
                ? {
                      position: lastPlayed.lastPositionSec,
                      duration: lastPlayed.durationSec,
                  }
                : undefined,
        [lastPlayedOnly, lastPlayed],
    );

    const openPlayer = useCallback(() => {
        const base =
            (pathname.split('?')[0] ?? pathname).replace(/\/$/, '') || '/';
        // Skip storing /player so dismiss still uses stack fallbacks if something went wrong.
        if (base !== '/player' && !base.startsWith('/player/')) {
            setFullPlayerReturnPath(base);
        }
        setShowFullPlayer(true);
        if (sermonId.length > 0) {
            router.push({ pathname: '/player', params: { id: sermonId } });
        } else {
            router.push('/player');
        }
    }, [
        router,
        pathname,
        setFullPlayerReturnPath,
        setShowFullPlayer,
        sermonId,
    ]);

    const handleSwipe = useCallback(
        (direction: string) => {
            if (direction === 'Swiped Left') {
                if (canSkipNext) void skip(undefined);
            } else if (direction === 'Swiped Right') {
                if (!lastPlayedOnly && queue.length > 0) void previous();
            } else if (direction === 'Swiped Up') {
                openPlayer();
            }
        },
        [canSkipNext, skip, previous, lastPlayedOnly, queue.length, openPlayer],
    );

    const gesture = useMemo(
        () =>
            Gesture.Pan()
                // Run handlers on the JS thread (same pattern as SwipeableRow) so Reanimated + RNTP
                // never hit the UI runtime with sync calls like `addListener` when the bridge is healthy.
                .runOnJS(true)
                .activeOffsetX([-18, 18])
                .activeOffsetY([-22, 22])
                .onUpdate((event) => {
                    translateX.value = event.translationX;
                    translateY.value = event.translationY;
                })
                .onEnd((event) => {
                    const threshold = 100;
                    if (event.translationX > threshold) {
                        handleSwipe('Swiped Right');
                    } else if (event.translationX < -threshold) {
                        handleSwipe('Swiped Left');
                    } else if (event.translationY < -threshold) {
                        handleSwipe('Swiped Up');
                    }
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                }),
        [translateX, translateY, handleSwipe],
    );

    if (!allowInAppShell || !visible || hideForFullPlayer) {
        return null;
    }

    const { title, artist } = displayTitles(displayTrack, lastPlayed);

    return (
        <Animated.View style={[styles.shell, { bottom: bottomOffset }]}>
            <GestureDetector gesture={gesture}>
                <Animated.View>
                    <View style={styles.bar}>
                        <Pressable
                            onPress={openPlayer}
                            style={styles.mainPressable}
                            accessibilityRole="button"
                            accessibilityLabel="Open full player"
                        >
                            <Image
                                source={displayArtwork(
                                    displayTrack,
                                    lastPlayed,
                                )}
                                style={styles.artwork}
                            />
                            <View style={styles.textColumn}>
                                <Text
                                    size="xs"
                                    weight="regular"
                                    color={colors.grey[100]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    textStyle={styles.miniLineText}
                                >
                                    {title}
                                </Text>
                                <Text
                                    size="xs"
                                    weight="regular"
                                    color={colors.grey[200]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    textStyle={styles.miniLineText}
                                >
                                    {artist}
                                </Text>
                            </View>
                        </Pressable>

                        <View style={styles.actions}>
                            <Pressable
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    isFavorite
                                        ? 'Remove favorite'
                                        : 'Add favorite'
                                }
                                onPress={() => {
                                    if (sermonId) void toggleFavoriteId(sermonId);
                                }}
                            >
                                {isFavorite ? (
                                    <SolidIcons.HeartIcon
                                        width={ICON_SIZE}
                                        height={ICON_SIZE}
                                        color={colors.teal[500]}
                                    />
                                ) : (
                                    <OutlineIcons.HeartIcon
                                        width={ICON_SIZE}
                                        height={ICON_SIZE}
                                        color={colors.white[50]}
                                    />
                                )}
                            </Pressable>
                            {lastPlayedOnly ? (
                                <Pressable
                                    hitSlop={8}
                                    onPress={() => void resumeLastPlayed()}
                                    accessibilityRole="button"
                                    accessibilityLabel="Resume playback"
                                >
                                    <OutlineIcons.PlayIcon
                                        width={ICON_SIZE}
                                        height={ICON_SIZE}
                                        color={colors.white[50]}
                                    />
                                </Pressable>
                            ) : (
                                <PlayPauseButton size={ICON_SIZE} />
                            )}
                            <Pressable
                                hitSlop={8}
                                onPress={() => {
                                    if (canSkipNext) void skip(undefined);
                                }}
                                disabled={!canSkipNext}
                                style={
                                    !canSkipNext
                                        ? styles.actionDisabled
                                        : undefined
                                }
                                accessibilityRole="button"
                                accessibilityLabel="Skip forward"
                            >
                                <Next
                                    size={ICON_SIZE}
                                    variant="Outline"
                                    color={colors.white[50]}
                                />
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        onPress={openPlayer}
                        accessibilityRole="button"
                        accessibilityLabel="Open full player"
                    >
                        <MiniPlayerThinProgress
                            staticFromLastPlayed={
                                staticFromLastPlayedForProgress
                            }
                        />
                    </Pressable>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const MiniPlayerThinProgress = memo(function MiniPlayerThinProgress({
    staticFromLastPlayed,
}: {
    staticFromLastPlayed?: { position: number; duration: number };
}): React.JSX.Element {
    const { position, duration } = useProgress(MINIPLAYER_UPDATE_INTERVAL);

    const pos = staticFromLastPlayed?.position ?? position;
    const dur = staticFromLastPlayed?.duration ?? duration;
    const safeDur = Math.max(dur, 1e-6);
    const pct = Math.min(100, Math.max(0, (pos / safeDur) * 100));

    return (
        <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
    );
});

const styles = StyleSheet.create({
    shell: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 50,
    },
    bar: {
        backgroundColor: colors.grey[500],
        minHeight: BAR_MIN_HEIGHT,
        paddingHorizontal: sizes.spacing.base,
        paddingVertical: sizes.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainPressable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },
    artwork: {
        width: ARTWORK,
        height: ARTWORK,
        borderRadius: sizes.spacing.xs,
    },
    textColumn: {
        flex: 1,
        marginLeft: sizes.spacing.sm,
        minWidth: 0,
        justifyContent: 'center',
        gap: sizes.spacing.xs,
    },
    miniLineText: {
        lineHeight: 18,
        letterSpacing: 0.24,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.spacing.base,
        marginLeft: sizes.spacing.sm,
    },
    actionDisabled: {
        opacity: 0.35,
    },
    progressTrack: {
        height: PROGRESS_HEIGHT,
        backgroundColor: colors.grey[400],
        borderRadius: sizes.radius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: PROGRESS_HEIGHT,
        backgroundColor: colors.white[600],
        borderRadius: sizes.radius.full,
    },
});

export default MiniPlayer;
