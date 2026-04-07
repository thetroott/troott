import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import cover1 from "@/assets/images/cover3.jpg";
import cover2 from "@/assets/images/cover4.jpg";
import { Image } from "react-native";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { Heart, Star, Star1 } from "iconsax-react-nativejs";
import { SolidIcons } from "@/assets/icons";

interface SavedTracksProps {
  albumCovers: string[];
}
const SavedTracks = () => {
  return (
    <Pressable style={{gap:10}}>
      <View style={styles.container}>
        <Image source={cover1} style={styles.image} />
        <Image source={cover2} style={styles.image} />
      </View>
      <View style={{gap:5}}>
        <View style={styles.textContainer}>
          <SolidIcons.StarIcon color="#FCD53F"/>
          <Text color={theme.colors.white[50]} weight="medium" size="base">
            Saved by you
          </Text>
        </View>
        <Text>Saved to your library</Text>
      </View>
    </Pressable>
  );
};

export default SavedTracks;

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
    width: theme.sizes.screen.width * 0.22,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
