import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { useTrackStore } from "@/stores/player-store";
import { Heart, Next } from "iconsax-react-nativejs";
import { theme } from "@/constants/theme";
import { useProgress } from "@/engine/queries/playback-queries";
import { PROGRESS_UPDATE_EVENT_INTERVAL } from "@/engine/constants/engine";
import { usePrevious, useSkip } from "@/engine/hooks/useControl";

const FALLBACK_IMAGE = require("@/assets/images/liked.png");

const MiniPlayer = () => {
  const { currentTrack, showFullPlayer, setShowFullPlayer, showMiniPlayer } =
    useTrackStore();
  const progress = useProgress(PROGRESS_UPDATE_EVENT_INTERVAL);
  const skipNext = useSkip();
  const skipPrevious = usePrevious();

  if (!currentTrack || showFullPlayer || !showMiniPlayer) return null;

  const title = currentTrack.title;
  const minister =
    (currentTrack as { minister?: string; artist?: string }).minister ??
    (currentTrack as { minister?: string; artist?: string }).artist;
  const image =
    (currentTrack as { image?: ImageSourcePropType; artwork?: ImageSourcePropType }).image ??
    (currentTrack as { image?: ImageSourcePropType; artwork?: ImageSourcePropType }).artwork;
  const progressPercent = progress.duration
    ? (progress.position / progress.duration) * 100
    : 0;

  return (
    <Pressable
      onPress={() => setShowFullPlayer(true)}
      className="absolute bottom-[70px] left-0 right-0 flex-row items-center justify-between bg-neutral-600 p-2.5"
    >
      <View className="w-[40%] flex-row items-center gap-2.5">
        <Image
          className="h-[50px] w-[50px] rounded-lg"
          source={(image as ImageSourcePropType) || FALLBACK_IMAGE}
        />
        <View className="gap-1.5">
          <Text numberOfLines={1} size="base" className="text-neutral-100">
            {title}
          </Text>
          <Text numberOfLines={1} size="xs" className="text-neutral-100">
            {minister}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-5">
        <Pressable onPress={() => void skipPrevious()}>
          <Heart color={theme.colors.white[50]} />
        </Pressable>
        <Pressable onPress={() => void skipNext()}>
          <Next color={theme.colors.white[50]} variant="Bold" />
        </Pressable>
      </View>
      <View
        className="absolute bottom-0 left-0 z-[1] h-0.5 bg-neutral-100"
        style={{ width: `${progressPercent}%` }}
      />
      <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-600" />
    </Pressable>
  );
};

export default MiniPlayer;
