import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import liked from "@/assets/images/liked.png";
import { Image } from "react-native";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";

interface ILikedbyuser {
  albumCovers: string[];
}
const LikedByUser = () => {
  return (
    <Pressable style={{gap:10}}>
      <View style={styles.container}>
        <Image source={liked} style={styles.image} />
      </View>
      <View style={{gap:5}}>
        <View style={styles.textContainer}>
          
          <Text color={theme.colors.white[50]} weight="medium" size="base">
            Liked by you
          </Text>
        </View>
        <Text>Saved to your Library</Text>
      </View>
    </Pressable>
  );
};

export default LikedByUser;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: theme.sizes.screen.width * 0.44,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: theme.sizes.screen.width * 0.44,
    width: theme.sizes.screen.width * 0.44,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
