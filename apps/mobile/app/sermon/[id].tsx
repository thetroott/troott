import React, { useMemo, useCallback, useEffect } from "react";
import type { LastPlayedSummary } from "@/engine/state/player-queue-store";
import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import {
  Heart,
  Next,
  Previous,
  Repeat,
  Send,
  Shuffle,
} from "iconsax-react-nativejs";
import { SolidIcons } from "@/assets/icons";
import Slider from "@react-native-community/slider";
import { useTrackStore } from "@/stores/player-store";
import Animated, {
  runOnJS,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { TrackDetailsHeader } from "@/components/containers/sermon";
import { RepeatMode } from "@rntp/player";
import { UiPlaybackState } from "@/engine/constants/playback-ui";
import { useLocalSearchParams } from "expo-router";
import {
  useCurrentTrack,
  useLastPlayed,
  usePlayQueue,
  useRepeatModeStoreValue,
  useShuffle,
} from "@/stores/player/queue";
import type { ISermonTrack, SermonTrackDTO } from "@/dtos/sermon.dto";
import { MINIPLAYER_UPDATE_INTERVAL } from "@/engine/constants/engine";
import { useProgress, usePlaybackState } from "@/engine/queries/playback-queries";
import {
  usePrevious,
  useSeekTo,
  useSkip,
  useTogglePlayback,
  useToggleRepeatMode,
  useToggleShuffle,
} from "@/engine/hooks/useControl";
import { useSermonsCatalog } from "@/engine/hooks/useSermonsCatalog";
import { usePlayFromCatalogList } from "@/hooks/player/use-play-from-catalog-list";
import { useResumeLastPlayed } from "@/hooks/player/use-resume-last-played";
import { useDismissFullPlayer } from "@/hooks/player/use-dismiss-full-player";
import { useCanSkipNext } from "@/hooks/player/use-can-skip-next";

const FALLBACK_IMAGE = require("@/assets/images/liked.png");

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
      sourceType: "stream",
    },
    sourceType: "stream",
    sessionId: null,
  } as SermonTrackDTO;
}

/** Resolve track image for display: supports both URI (string) and local require (number). Use with Image (not FastImage) so local assets work. */
function getTrackImageSource(track: SermonTrackDTO | { image?: unknown; artwork?: unknown } | null): ImageSourcePropType {
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
  if (typeof raw === "number") return raw as ImageSourcePropType;
  if (typeof raw === "string" && raw.length > 0) return { uri: raw };
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

const FullPlayerTrackDetails: React.FC<FullPlayerTrackDetailsProps> = ({
  embedInTabsShell = false,
}) => {
  const { id } = useLocalSearchParams();
  /** Expo Router params can be string | string[]; queue rows may use string or number ids. */
  const routeSermonId = useMemo(() => {
    const raw = Array.isArray(id) ? id[0] : id;
    if (raw === undefined || raw === null) return "";
    const s = String(raw).trim();
    return s;
  }, [id]);
  const showFullPlayer = useTrackStore((state) => state.showFullPlayer);
  const currentTrack = useCurrentTrack();
  const lastPlayed = useLastPlayed();
  const { data: sermons, isLoading } = useSermonsCatalog();
  const playFromCatalog = usePlayFromCatalogList("Library");
  const { top } = useSafeAreaInsets();
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
            translateY.value > DISMISS_DRAG_THRESHOLD || e.velocityY > DISMISS_VELOCITY;
          if (shouldClose) {
            translateY.value = withTiming(
              screenH,
              { duration: DISMISS_SLIDE_MS },
              (finished) => {
                if (finished) runOnJS(dismiss)();
              },
            );
          } else {
            translateY.value = withSpring(0, { damping: 28, stiffness: 280 });
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
      uiTrack?.item?.id != null
        ? String(uiTrack.item.id)
        : routeSermonId;
    const list = sermons as ISermonTrack[] | undefined;
    if (!sid || !list?.length) return base;
    const row = list.find((s) => String(s.id ?? "") === sid);
    const img = row?.image;
    if (img == null) return base;
    if (typeof img === "number") return img;
    if (typeof img === "string" && img.length > 0) return { uri: img };
    return base;
  }, [uiTrack, sermons, routeSermonId]);

  useEffect(() => {
    if (!routeSermonId || !sermons?.length || isLoading) return;
    const currentId =
      currentTrack?.item?.id != null ? String(currentTrack.item.id) : "";
    if (currentId === routeSermonId) return;
    const idx = sermons.findIndex((s) => String(s.id ?? "") === routeSermonId);
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

  if (!uiTrack && !routeSermonId && !isLoading && !lastPlayed?.sermonId)
    return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: top },
        sheetAnimatedStyle,
        !showFullPlayer && { position: "absolute" },
      ]}
      entering={SlideInDown.duration(500)}
    >
      <GestureDetector gesture={dragToCloseGesture}>
        <View style={styles.dragAndHero} collapsable={false}>
          <View style={styles.dragPill} accessibilityRole="adjustable" accessibilityLabel="Drag down to close player" />
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

        <SermonDetails track={uiTrack ?? null} />
      </Animated.ScrollView>
    </Animated.View>
  );
};

function TrackActionsController({ track }: { track: SermonTrackDTO | null }) {
  const [liked, setLiked] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [queued, setQueued] = React.useState(false);

  if (!track) return null;

  return (
    <View style={styles.actionContainer}>
      <View style={styles.trackInfo}>
        <Text
          color={colors.white[100]}
          size="md"
          weight="semiBold"
          numberOfLines={1}
        >
          {track.title || track.item?.title || "Track Title"}
        </Text>
        <Text>{track.artist ?? "Unknown minister"}</Text>
      </View>

      <View style={styles.iconsContainer}>
        <Pressable
          onPress={() => setLiked((p) => !p)}
          accessibilityLabel="Like Track"
        >
          <Heart
            color={liked ? colors.teal[500] : colors.white[100]}
            size={28}
          />
        </Pressable>
        <Pressable
          onPress={() => setShared((p) => !p)}
          accessibilityLabel="Share Track"
        >
          <Send color={colors.white[100]} size={28} />
        </Pressable>
        <Pressable
          onPress={() => setQueued((p) => !p)}
          accessibilityLabel="Queue Track"
        >
          <SolidIcons.QueueListIcon
            color={queued ? colors.teal[500] : colors.white[100]}
            size={28}
          />
        </Pressable>
      </View>
    </View>
  );
}

function TrackProgress() {
  const shuffle = useShuffle();
  const repeatModeRn = useRepeatModeStoreValue();
  const progress = useProgress(MINIPLAYER_UPDATE_INTERVAL);
  const playbackState = usePlaybackState();
  const togglePlayback = useTogglePlayback();
  const seekTo = useSeekTo();
  const skip = useSkip();
  const previous = usePrevious();
  const canSkipNext = useCanSkipNext();
  const toggleRepeatMode = useToggleRepeatMode();
  const toggleShuffleMut = useToggleShuffle();
  const queue = usePlayQueue();
  const lastPlayed = useLastPlayed();
  const resumeLastPlayed = useResumeLastPlayed();

  const trackPlaying = playbackState === UiPlaybackState.Playing;

  const positionUi =
    progress.duration > 0.5
      ? progress.position
      : (lastPlayed?.lastPositionSec ?? 0);
  const durationUi =
    progress.duration > 0.5
      ? progress.duration
      : Math.max(lastPlayed?.durationSec ?? 0, 1);

  const formattedPosition = useMemo(
    () => formatTime(positionUi),
    [positionUi]
  );
  const formattedDuration = useMemo(
    () => formatTime(durationUi),
    [durationUi]
  );

  const toggleRepeat = useCallback(() => {
    void toggleRepeatMode();
  }, [toggleRepeatMode]);

  const toggleShuffle = useCallback(() => {
    void toggleShuffleMut.mutateAsync(shuffle);
  }, [shuffle, toggleShuffleMut]);

  const onSeekComplete = useCallback(
    (val: number) => {
      void seekTo(val);
    },
    [seekTo]
  );

  const repeatActive =
    repeatModeRn !== RepeatMode.Off;

  return (
    <View style={styles.progressContainer}>
      <Slider
        minimumValue={0}
        maximumValue={durationUi}
        value={positionUi}
        minimumTrackTintColor={colors.teal[500]}
        maximumTrackTintColor={theme.colors.grey[400]}
        onSlidingComplete={onSeekComplete}
      />

      <View style={styles.timeContainer}>
        <Text>{formattedPosition}</Text>
        <Text>{formattedDuration}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <Pressable onPress={toggleShuffle} accessibilityLabel="Shuffle">
          <Shuffle
            color={shuffle ? colors.teal[500] : theme.colors.white[50]}
          />
        </Pressable>

        <View style={styles.playbackButtons}>
          <Pressable
            onPress={() => void previous()}
            accessibilityLabel="Previous Track"
          >
            <Previous color={theme.colors.white[50]} variant="Bold" />
          </Pressable>

          <Pressable
            style={styles.playBtn}
            onPress={() => {
              if (queue.length === 0 && lastPlayed?.streamUrl) {
                void resumeLastPlayed();
                return;
              }
              void togglePlayback();
            }}
            accessibilityLabel={trackPlaying ? "Pause" : "Play"}
          >
            {trackPlaying ? (
              <SolidIcons.PauseIcon color={theme.colors.black[50]} size={28} />
            ) : (
              <SolidIcons.PlayIcon color={theme.colors.black[50]} size={28} />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (canSkipNext) void skip(undefined);
            }}
            disabled={!canSkipNext}
            style={!canSkipNext ? styles.controlDisabled : undefined}
            accessibilityLabel="Next Track"
          >
            <Next color={theme.colors.white[50]} variant="Bold" />
          </Pressable>
        </View>

        <Pressable onPress={toggleRepeat} accessibilityLabel="Repeat">
          <Repeat
            color={
              repeatActive ? colors.teal[500] : theme.colors.white[50]
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

function SermonDetails({ track }: { track: SermonTrackDTO | null }) {
  if (!track) return null;

  const title = track.title ?? track.item?.title ?? "Unknown Title";
  const minister = track.artist ?? "Unknown minister";

  return (
    <View style={styles.sermonDetails}>
      <Text size="md" color={colors.white[100]} weight="medium">
        Sermon Details
      </Text>

      <View style={styles.sermonContent}>
        <Image
          source={getTrackImageSource(track)}
          style={styles.sermonImage}
          resizeMode="cover"
        />

        <View style={styles.sermonText}>
          <Text weight="medium" color={colors.white[100]} size="base">
            {title}
          </Text>
          <Text>{minister}</Text>
          <Text size="xs">
            {(track.item as { totalPlays?: number } | undefined)?.totalPlays ?? "2340"} plays •{" "}
            {formatTime(typeof track.duration === "number" ? track.duration : 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.black[50],
    padding: theme.sizes.spacing.md,
  },
  scrollContent: { gap: theme.sizes.spacing.xl, paddingBottom: theme.sizes.spacing["2xl"] },
  dragAndHero: {
    gap: theme.sizes.spacing.sm,
    marginBottom: theme.sizes.spacing.md,
  },
  dragPill: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: theme.sizes.radius.full,
    backgroundColor: theme.colors.grey[400],
    marginBottom: theme.sizes.spacing.xs,
  },
  image: {
    height: theme.sizes.screen.height * 0.4,
    borderRadius: theme.sizes.radius.md,
    width: "100%",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackInfo: { gap: theme.sizes.spacing.sm, width: "50%" },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.sizes.spacing.md,
  },
  progressContainer: { gap: theme.sizes.spacing.sm },
  timeContainer: { flexDirection: "row", justifyContent: "space-between" },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playbackButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.sizes.spacing.xl,
  },
  playBtn: {
    backgroundColor: theme.colors.white[50],
    padding: theme.sizes.spacing.md,
    borderRadius: theme.sizes.radius.full,
  },
  sermonDetails: { gap: theme.sizes.spacing.md, marginTop: 30 },
  sermonContent: {
    flexDirection: "row",
    gap: theme.sizes.spacing.md,
    alignItems: "center",
  },
  sermonImage: { height: 80, width: 80, borderRadius: theme.sizes.radius.sm },
  sermonText: { gap: theme.sizes.spacing.xs },
  controlDisabled: { opacity: 0.35 },
});

export default FullPlayerTrackDetails;