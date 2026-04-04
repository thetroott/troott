import { Pressable, View } from "react-native";
import React from "react";
import { SolidIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";
import { useTrackStore } from "@/stores/player-store";

const TrackDetailsHeader = () => {
  const { setShowFullPlayer } = useTrackStore();

  return (
    <View className="mt-4 flex-row items-center justify-between">
      <Pressable
        onPress={() => setShowFullPlayer(false)}
        accessibilityRole="button"
        accessibilityLabel="Close player"
      >
        <SolidIcons.ChevronDownIcon
          size={theme.sizes.spacing.md}
          color="#fff"
        />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="More options">
        <SolidIcons.EllipsisHorizontalIcon
          size={theme.sizes.spacing.lg}
          color="#fff"
        />
      </Pressable>
    </View>
  );
};

export default TrackDetailsHeader;