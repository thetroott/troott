import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { SolidIcons } from "@/assets/icons";

const BOX_SIZE = theme.sizes.screen.width * 0.44;

const UserHighlights = () => {
  return (
    <Pressable className="gap-2.5" accessibilityRole="button" accessibilityLabel="Troott Highlights">
      <View style={styles.container}>
        <View style={styles.box}>
          <Pressable className="rounded-full bg-teal-400 p-4" accessibilityRole="button" accessibilityLabel="Play">
            <SolidIcons.PlayIcon
              color={theme.colors.black[50]}
              size={28}
              style={{ transform: [{ translateX: 1 }] }}
            />
          </Pressable>
        </View>
      </View>
      <View className="gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-neutral-100" weight="medium" size="base">
            Troott Highlights
          </Text>
        </View>
        <Text className="text-neutral-400">View Recent Updates</Text>
      </View>
    </Pressable>
  );
};

export default UserHighlights;

// Allowed exception: runtime dimension (screen width) for box size.
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: BOX_SIZE,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
  },
  box: {
    height: BOX_SIZE,
    width: BOX_SIZE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
  },
});
