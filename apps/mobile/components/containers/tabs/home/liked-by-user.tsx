import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import liked from "@/assets/images/liked.png";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";

const CARD_SIZE = theme.sizes.screen.width * 0.44;

const LikedByUser = () => {
  return (
    <Pressable className="gap-2.5" accessibilityRole="button" accessibilityLabel="Liked by you">
      <View style={styles.container}>
        <Image source={liked} style={styles.image} />
      </View>
      <View className="gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-neutral-100" weight="medium" size="base">
            Liked by you
          </Text>
        </View>
        <Text className="text-neutral-400">Saved to your Library</Text>
      </View>
    </Pressable>
  );
};

export default LikedByUser;

// Allowed exception: runtime dimension (screen width) for card size.
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: CARD_SIZE,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: CARD_SIZE,
    width: CARD_SIZE,
  },
});
