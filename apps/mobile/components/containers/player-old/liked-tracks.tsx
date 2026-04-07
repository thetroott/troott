import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import cover1 from "@/assets/images/cover.jpg";
import cover2 from "@/assets/images/cover2.jpg";
import { Image } from "react-native";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { Heart } from "iconsax-react-nativejs";

interface LikedTracksProps {
  albumCovers: string[];
}
const LikedTracks = () => {
  return (
    <Pressable style={{gap:10}}>
      <View style={styles.container}>
        <Image source={cover1} style={styles.image} />
        <Image source={cover2} style={styles.image} />
        <Image source={cover2} style={styles.image} />
        <Image source={cover1} style={styles.image} />
      </View>
      <View style={{gap:5}}>
        <View style={styles.textContainer}>
          <Heart color="#F44336" variant="Bold" />
          <Text color={theme.colors.white[50]} weight="medium" size="base">
            Liked by you
          </Text>
        </View>
        <Text>Saved to your library</Text>
      </View>
    </Pressable>
  );
};

export default LikedTracks;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: theme.sizes.screen.width * 0.44,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: theme.sizes.screen.width * 0.22,
    width: theme.sizes.screen.width * 0.22,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
