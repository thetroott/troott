import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import cover1 from "@/assets/images/cover3.jpg";
import cover2 from "@/assets/images/cover4.jpg";
import Text from "@/components/ui/text";
import { SolidIcons } from "@/assets/icons";
import { sizes } from "@/constants/sizes";

const SavedTracks = () => {
  return (
    <Pressable className="gap-2.5" accessibilityRole="button" accessibilityLabel="Saved by you">
      <View style={styles.container}>
        <Image source={cover1} style={styles.image} />
        <Image source={cover2} style={styles.image} />
      </View>
      <View className="gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <SolidIcons.StarIcon color="#FCD53F" />
          <Text className="text-neutral-100" weight="medium" size="base">
            Saved by you
          </Text>
        </View>
        <Text className="text-neutral-400">Saved to your library</Text>
      </View>
    </Pressable>
  );
};

export default SavedTracks;

// Allowed exception: runtime dimensions (screen width) for grid.
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: sizes.screen.width * 0.44,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: sizes.screen.width * 0.44,
    width: sizes.screen.width * 0.22,
  },
});
