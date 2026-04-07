import { OutlineIcons, SolidIcons } from "@/assets/icons";
import { MINIPLAYER_UPDATE_INTERVAL } from "@/engine/constants/engine";
import { useProgress } from "@/engine/queries/playback-queries";
import { usePrevious, useSkip } from "@/engine/hooks/useControl";
import {
	useCurrentIndex,
	useCurrentTrack,
	useLastPlayed,
	usePlayQueue,
} from "@/stores/player/queue";
import { colors } from "@/constants/colors";
import { sizes } from "@/constants/sizes";
import { usePathname, useRouter, useSegments } from "expo-router";
import React, { useCallback, useMemo, memo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
import type { LastPlayedSummary } from "@/engine/state/player-queue-store";
import type { SermonItemDTO } from "@/types/sermon";
import type { SermonTrackDTO } from "@/dtos/sermon.dto";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/text";
import { useIsNowPlayingStackRouteFocused } from "@/hooks/navigation/now-playing-route";
import PlayPauseButton from "@/components/containers/engine/player/play-pause";
import { Next } from "iconsax-react-nativejs";
import { useTrackStore } from "@/stores/player-store";
import { useFavoriteSermonIdsStore } from "@/engine/state/favorite-sermon-ids-store";
import { useResumeLastPlayed } from "@/hooks/player/use-resume-last-played";
import { useCanSkipNext } from "@/hooks/player/use-can-skip-next";

const FALLBACK_ART = require("@/assets/images/liked.png");

const ARTWORK = 35;
const BAR_MIN_HEIGHT = 54;
const PROGRESS_HEIGHT = 2;
const ICON_SIZE = 24;
/** Tab row + custom tab bar bottom safe padding (see `TabBar`). */
const TAB_BAR_CONTENT = 72;

const MAIN_TAB_NAMES = new Set(["home", "search", "library", "profile"]);

/** Spotify-style: hide mini player while full-screen / modal now-playing is presented. */
function useShouldHideMiniPlayer(): boolean {
	const pathname = usePathname();
	const segments = useSegments();
	const base = pathname.split("?")[0] ?? "";
	const baseNorm = base.replace(/\/$/, "") || "/";
	if (segments.includes("track") || segments.includes("player")) return true;
	if (baseNorm === "/track" || base.startsWith("/track/")) return true;
	if (baseNorm === "/player" || base.startsWith("/player/")) return true;
	if (baseNorm.includes("/track") || segments.some((s) => s === "track")) return true;
	return false;
}

/**
 * Welcome, auth, and onboarding are not part of the listening shell; do not show the mini player there.
 */
function useAllowMiniPlayerForCurrentRoute(): boolean {
	const pathname = usePathname();
	const segments = useSegments();
	const base = (pathname.split("?")[0] ?? "").replace(/\/$/, "") || "/";

	if (segments.includes("auth") || segments.includes("onboarding")) return false;
	if (base === "/" || base === "") return false;
	if (base.startsWith("/auth") || base.startsWith("/onboarding")) return false;
	// Root index / welcome (Expo may report segment `index` without tabs)
	if (segments.length === 1 && segments[0] === "index") return false;

	return true;
}

/**
 * Mini player sits above the tab bar. Some Expo Router builds omit `(tabs)` from
 * `useSegments()`, which would overlap the tab bar; pathname is used as a fallback.
 */
function useIsMainTabsShell(): boolean {
	const segments = useSegments();
	const pathname = usePathname();

	if (segments.includes("(tabs)")) return true;

	const last = segments.length > 0 ? segments[segments.length - 1] : "";
	if (typeof last === "string" && MAIN_TAB_NAMES.has(last)) return true;

	const p = pathname.split("?")[0] ?? "";
	if (MAIN_TAB_NAMES.has(p.replace(/^\//, "").split("/").pop() ?? "")) return true;

	return /\(tabs\)\/(home|search|library|profile)(\/|$)/.test(p);
}

function miniPlayerArtSource(nowPlaying: SermonTrackDTO | undefined): ImageSourcePropType {
	const raw = nowPlaying?.artwork ?? nowPlaying?.artworkUrl ?? nowPlaying?.item?.image;
	if (raw == null) return FALLBACK_ART;
	if (typeof raw === "number") return raw;
	if (typeof raw === "string" && raw.length > 0) return { uri: raw };
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

function displayTitles(track: SermonTrackDTO | undefined, lastPlayed: LastPlayedSummary | undefined) {
	if (track) {
		const item = track.item as SermonItemDTO | undefined;
		return {
			title: track.title ?? item?.title ?? "",
			artist: track.artist ?? item?.minister ?? "",
		};
	}
	if (lastPlayed?.sermonId) {
		return { title: lastPlayed.title, artist: lastPlayed.artist };
	}
	return { title: "", artist: "" };
}

function resolveSermonId(
	track: SermonTrackDTO | undefined,
	lastPlayed: LastPlayedSummary | undefined,
): string {
	if (track?.item?.id != null) return String(track.item.id);
	if (track?.mediaId) return String(track.mediaId);
	if (lastPlayed?.sermonId) return lastPlayed.sermonId;
	return "";
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
	const setFullPlayerReturnPath = useTrackStore((s) => s.setFullPlayerReturnPath);
	const pathname = usePathname();
	const nowPlayingRouteFocused = useIsNowPlayingStackRouteFocused();
	const toggleFavoriteId = useFavoriteSermonIdsStore((s) => s.toggleFavorite);
	const favoriteIds = useFavoriteSermonIdsStore((s) => s.ids);
	const resumeLastPlayed = useResumeLastPlayed();

	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);

	/** Hide while `/track` modal is up: pathname can lag; `showFullPlayer` + nav state must agree. */
	const hideForFullPlayer =
		useShouldHideMiniPlayer() || showFullPlayer || nowPlayingRouteFocused;
	const allowInAppShell = useAllowMiniPlayerForCurrentRoute();
	const aboveMainTabs = useIsMainTabsShell();
	const bottomOffset = (aboveMainTabs ? TAB_BAR_CONTENT : 0) + insets.bottom;

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
	const isFavorite = sermonId ? favoriteIds.includes(sermonId) : false;

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
		const base = (pathname.split("?")[0] ?? pathname).replace(/\/$/, "") || "/";
		// Skip storing /track so dismiss still uses stack fallbacks if something went wrong.
		if (base !== "/track" && !base.startsWith("/track/")) {
			setFullPlayerReturnPath(base);
		}
		setShowFullPlayer(true);
		if (sermonId.length > 0) {
			router.push({ pathname: "/track", params: { id: sermonId } });
		} else {
			router.push("/track");
		}
	}, [router, pathname, setFullPlayerReturnPath, setShowFullPlayer, sermonId]);

	const handleSwipe = useCallback(
		(direction: string) => {
			if (direction === "Swiped Left") {
				if (canSkipNext) void skip(undefined);
			} else if (direction === "Swiped Right") {
				if (!lastPlayedOnly && queue.length > 0) void previous();
			} else if (direction === "Swiped Up") {
				openPlayer();
			}
		},
		[canSkipNext, skip, previous, lastPlayedOnly, queue.length, openPlayer],
	);

	const gesture = useMemo(
		() =>
			Gesture.Pan()
				.activeOffsetX([-18, 18])
				.activeOffsetY([-22, 22])
				.onUpdate((event) => {
					translateX.value = event.translationX;
					translateY.value = event.translationY;
				})
				.onEnd((event) => {
					const threshold = 100;
					if (event.translationX > threshold) {
						runOnJS(handleSwipe)("Swiped Right");
					} else if (event.translationX < -threshold) {
						runOnJS(handleSwipe)("Swiped Left");
					} else if (event.translationY < -threshold) {
						runOnJS(handleSwipe)("Swiped Up");
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
								source={displayArtwork(displayTrack, lastPlayed)}
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
								accessibilityLabel={isFavorite ? "Remove favorite" : "Add favorite"}
								onPress={() => {
									if (sermonId) toggleFavoriteId(sermonId);
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
								style={!canSkipNext ? styles.actionDisabled : undefined}
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

					<Pressable onPress={openPlayer} accessibilityRole="button" accessibilityLabel="Open full player">
						<MiniPlayerThinProgress staticFromLastPlayed={staticFromLastPlayedForProgress} />
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
		position: "absolute",
		left: 0,
		right: 0,
		zIndex: 50,
	},
	bar: {
		backgroundColor: colors.grey[500],
		minHeight: BAR_MIN_HEIGHT,
		paddingHorizontal: sizes.spacing.base,
		paddingVertical: sizes.spacing.sm,
		flexDirection: "row",
		alignItems: "center",
	},
	mainPressable: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
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
		justifyContent: "center",
		gap: sizes.spacing.xs,
	},
	miniLineText: {
		lineHeight: 18,
		letterSpacing: 0.24,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
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
		overflow: "hidden",
	},
	progressFill: {
		height: PROGRESS_HEIGHT,
		backgroundColor: colors.white[600],
		borderRadius: sizes.radius.full,
	},
});

export default MiniPlayer;
