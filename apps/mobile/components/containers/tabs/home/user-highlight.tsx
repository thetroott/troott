import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { SolidIcons } from "@/assets/icons";

interface IUserHighlights {
  albumCovers: string[];
}
const UserHighlights = () => {
  return (
    <Pressable style={{ gap: 10 }}>
      <View style={styles.container}>
        <View style={styles.box}>
          <Pressable style={styles.playBtn}>
            <SolidIcons.PlayIcon
              color={theme.colors.black[50]}
              size={28}
              style={{
                transform: [
                  {
                    translateX: 1,
                  },
                ],
              }}
            />
          </Pressable>
        </View>
      </View>
      <View style={{ gap: 5 }}>
        <View style={styles.textContainer}>
          <Text color={theme.colors.white[50]} weight="medium" size="base">
            Troott Highlights
          </Text>
        </View>
        <Text>View Recent Updates</Text>
      </View>
    </Pressable>
  );
};

export default UserHighlights;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: theme.sizes.screen.width * 0.44,
    flexWrap: "wrap",
    borderRadius: 10,
    overflow: "hidden",
    color: "#252525",
  },
  box: {
    height: theme.sizes.screen.width * 0.44,
    width: theme.sizes.screen.width * 0.44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  playBtn: {
    padding: theme.sizes.spacing.md,
    borderRadius: theme.sizes.radius.full,
    backgroundColor: "#08FFDB",
  },
});
