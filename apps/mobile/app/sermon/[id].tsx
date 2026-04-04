import React, { useMemo, useCallback, useEffect } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { TrackDetailsHeader } from "@/components/containers/sermon";
import { useProgress } from "@/engine/queries/playback-queries";
import { PROGRESS_UPDATE_EVENT_INTERVAL } from "@/engine/constants/engine";
import {
  useLegacySyncedTogglePlayback,
  useSeekTo,
  useSkip,
  usePrevious,
  useApplyLegacyRepeatMode,
  useToggleShuffle,
} from "@/engine/hooks/useControl";
import { useSermonsCatalogQuery } from "@/engine/hooks/useSermonsCatalogQuery";
import { usePlayFromCatalog } from "@/engine/hooks/usePlayFromCatalog";
import { tracks } from "@/_data/_mock/tracks";
import { mockSermonRowToItem } from "@/engine/helpers/mockSermonRowToItem";
import { useLocalSearchParams } from "expo-router";

const FALLBACK_IMAGE = require("@/assets/images/liked.png");

/** Resolve track image for display: supports both URI (string) and local require (number). Use with Image (not FastImage) so local assets work. */
function getTrackImageSource(track: { image?: unknown; artwork?: unknown } | null): ImageSourcePropType {
  const raw = track?.image ?? track?.artwork;
  if (raw == null) return FALLBACK_IMAGE;
  if (typeof raw === "number") return raw as ImageSourcePropType;
  if (typeof raw === "string" && raw.length > 0) return { uri: raw };
  return FALLBACK_IMAGE;
}

const FullPlayerTrackDetails = () => {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(idParam) ? idParam[0] : idParam;
  const showFullPlayer = useTrackStore((state) => state.showFullPlayer);
  const currentTrack = useTrackStore((state) => state.currentTrack);
  const { data: sermons, isLoading } = useSermonsCatalogQuery();
  const playFromCatalog = usePlayFromCatalog("Library");
  const { top } = useSafeAreaInsets();

  const catalogTracklist = useMemo(() => {
    if (sermons && sermons.length > 0) return sermons;
    return tracks.map((row) =>
      mockSermonRowToItem(row as Parameters<typeof mockSermonRowToItem>[0]),
    );
  }, [sermons]);

  useEffect(() => {
    if (!routeId || isLoading) return;
    if (currentTrack?.id === routeId) return;
    const trackToPlay = catalogTracklist.find((s) => s.id === routeId);
    if (trackToPlay) {
      void playFromCatalog(trackToPlay);
    }
  }, [routeId, isLoading, currentTrack?.id, catalogTracklist, playFromCatalog]);

  // Show full player either when showFullPlayer is true or when accessed via direct ID
  // Also ensure we have either a current track or are loading data
  if (!showFullPlayer && !routeId) return null;
  
  // If no current track and no ID provided, don't render
  if (!currentTrack && !routeId && !isLoading) return null;


  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: top },
        !showFullPlayer && { position: "absolute" },
      ]}
      entering={SlideInDown.duration(500)}
    >
      <TrackDetailsHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Image
            source={getTrackImageSource(currentTrack)}
            style={styles.image}
            resizeMode="cover"
          />
          <TrackActionsController track={currentTrack} />
          <TrackProgress />
          <SermonDetails />
        </View>
      </ScrollView>
    </Animated.View>
  );
};

function TrackActionsController({ track }: { track: any }) {
  const [liked, setLiked] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [queued, setQueued] = React.useState(false);

  return (
    <View className="flex-row items-center justify-between">
      <View className="w-1/2 gap-2">
        <Text
          className="text-neutral-100"
          size="md"
          weight="semiBold"
          numberOfLines={1}
        >
          {track.title || "Track Title"}
        </Text>
        <Text className="text-neutral-400">
          {(track as { minister?: string; artist?: string }).minister ??
            (track as { minister?: string; artist?: string }).artist ??
            "Unknown minister"}
        </Text>
      </View>
      <View className="flex-row items-center gap-4">
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
  const trackPlaying = useTrackStore((state) => state.trackPlaying);
  const shuffle = useTrackStore((state) => state.shuffle);
  const repeatMode = useTrackStore((state) => state.repeatMode);
  const setShuffle = useTrackStore((state) => state.setShuffle);
  const setRepeatMode = useTrackStore((state) => state.setRepeatMode);

  const progress = useProgress(PROGRESS_UPDATE_EVENT_INTERVAL);
  const togglePlayback = useLegacySyncedTogglePlayback();
  const seekTo = useSeekTo();
  const skipNext = useSkip();
  const skipPrevious = usePrevious();
  const applyLegacyRepeat = useApplyLegacyRepeatMode();
  const { mutate: runShuffleToggle } = useToggleShuffle();

  const formattedPosition = useMemo(
    () => formatTime(progress.position),
    [progress.position]
  );
  const formattedDuration = useMemo(
    () => formatTime(progress.duration),
    [progress.duration]
  );

  const toggleRepeat = useCallback(() => {
    const nextMode =
      repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    setRepeatMode(nextMode);
    void applyLegacyRepeat(nextMode);
  }, [repeatMode, setRepeatMode, applyLegacyRepeat]);

  const toggleShuffle = useCallback(() => {
    const next = !shuffle;
    setShuffle(next);
    runShuffleToggle(!next);
  }, [shuffle, setShuffle, runShuffleToggle]);

  const onSeekComplete = useCallback(
    (val: number) => {
      void seekTo(val);
    },
    [seekTo]
  );

  
  return (
    <View className="gap-2">
      <Slider
        minimumValue={0}
        maximumValue={progress.duration}
        value={progress.position}
        minimumTrackTintColor={colors.teal[500]}
        maximumTrackTintColor={theme.colors.grey[400]}
        onSlidingComplete={onSeekComplete}
      />
      <View className="flex-row justify-between">
        <Text className="text-neutral-400">{formattedPosition}</Text>
        <Text className="text-neutral-400">{formattedDuration}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={toggleShuffle} accessibilityLabel="Shuffle">
          <Shuffle
            color={shuffle ? colors.teal[500] : theme.colors.white[50]}
          />
        </Pressable>
        <View className="flex-row items-center gap-6">
          <Pressable
            onPress={() => void skipPrevious()}
            accessibilityLabel="Previous Track"
          >
            <Previous color={theme.colors.white[50]} variant="Bold" />
          </Pressable>
          <Pressable
            className="rounded-full bg-neutral-100 p-4"
            onPress={() => void togglePlayback()}
            accessibilityLabel={trackPlaying ? "Pause" : "Play"}
          >
            {trackPlaying ? (
              <SolidIcons.PauseIcon color={theme.colors.black[50]} size={28} />
            ) : (
              <SolidIcons.PlayIcon color={theme.colors.black[50]} size={28} />
            )}
          </Pressable>
          <Pressable
            onPress={() => void skipNext()}
            accessibilityLabel="Next Track"
          >
            <Next color={theme.colors.white[50]} variant="Bold" />
          </Pressable>
        </View>
        <Pressable onPress={toggleRepeat} accessibilityLabel="Repeat">
          <Repeat
            color={
              repeatMode !== "off" ? colors.teal[500] : theme.colors.white[50]
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

function SermonDetails() {
  const currentTrack = useTrackStore((state) => state.currentTrack);

  if (!currentTrack) return null;

  return (
    <View className="mt-8 gap-4">
      <Text size="md" className="text-neutral-100" weight="medium">
        Sermon Details
      </Text>
      <View className="flex-row items-center gap-4">
        <Image
          source={getTrackImageSource(currentTrack)}
          className="h-20 w-20 rounded"
          resizeMode="cover"
        />
        <View className="gap-0.5">
          <Text weight="medium" className="text-neutral-100" size="base">
            {currentTrack.title || "Unknown Title"}
          </Text>
          <Text className="text-neutral-400">
            {(currentTrack as { minister?: string; artist?: string }).minister ??
              (currentTrack as { minister?: string; artist?: string }).artist ??
              "Unknown minister"}
          </Text>
          <Text size="xs" className="text-neutral-500">
            {currentTrack.totalPlays || "2340"} plays •{" "}
            {currentTrack.duration || "0:00"}
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

// Allowed exceptions: container (position, paddingTop from insets), image (runtime height).
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
  image: {
    height: theme.sizes.screen.height * 0.4,
    borderRadius: theme.sizes.radius.md,
    width: "100%",
  },
});

export default FullPlayerTrackDetails;