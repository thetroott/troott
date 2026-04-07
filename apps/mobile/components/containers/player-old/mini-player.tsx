import { ImageSourcePropType, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { useTrackStore } from "@/stores/player-store";
import { Image } from "react-native";
import { Heart, Next } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import { useProgress } from "@/engine/queries/playback-queries";
import { MINIPLAYER_UPDATE_INTERVAL } from "@/engine/constants/engine";
import { useCurrentTrack } from "@/stores/player/queue";
import { usePrevious, useSkip } from "@/engine/hooks/useControl";

const FALLBACK_IMAGE = require("@/assets/images/liked.png");

const MiniPlayer = () => {
  const { showFullPlayer, setShowFullPlayer, showMiniPlayer } = useTrackStore();
  const currentTrack = useCurrentTrack();
  const skip = useSkip();
  const previous = usePrevious();
  const progress = useProgress(MINIPLAYER_UPDATE_INTERVAL);

  if (!currentTrack || showFullPlayer || !showMiniPlayer) return null;

  const title = currentTrack.title ?? currentTrack.item?.title;
  const minister = currentTrack.artist ?? "";
  const image =
    (currentTrack.artwork as ImageSourcePropType | undefined) ??
    (currentTrack.item?.image
      ? ({ uri: currentTrack.item.image } as ImageSourcePropType)
      : undefined);

  const progressPercent = progress.duration
    ? (progress.position / progress.duration) * 100
    : 0;

  return (
    <Pressable onPress={() => setShowFullPlayer(true)} style={styles.container}>
      <View style={styles.imageAndTitleContainer}>
        <Image
          style={styles.image}
          source={(image as ImageSourcePropType) || FALLBACK_IMAGE}
        />
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} size="base" color={theme.colors.white[50]}>
            {title}
          </Text>
          <Text numberOfLines={1} size="xs" color={theme.colors.white[50]}>
            {minister}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => void previous()}>
          <Heart color={theme.colors.white[50]} />
        </Pressable>

        <Pressable onPress={() => void skip(undefined)}>
          <Next color={theme.colors.white[50]} variant="Bold" />
        </Pressable>
      </View>

      <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      <View style={styles.progressBackground} />
    </Pressable>
  );
};

export default MiniPlayer;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#545454",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
  },
  imageAndTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "40%",
  },
  titleContainer: {
    gap: 5,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 8,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: theme.colors.white[50],
    zIndex: 1,
  },
  progressBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.grey[300],
  },
});
