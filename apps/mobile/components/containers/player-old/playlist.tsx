import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { IPlayListCard } from "./types";
import Text from "@/components/ui/text";
import TrackCard from "./track-card";
import { theme } from "@/constants/theme";
import Button from "@/components/ui/button";
import { SolidIcons } from "@/assets/icons";

const PlayList = ({
  title,
  description,
  coverImage,
  cardStyle,
  tracks,
  church,
}: IPlayListCard) => {
  return (
    <View style={[styles.container, cardStyle]}>
      <View style={styles.topContainer}>
        <Image
          source={
            (coverImage as ImageSourcePropType) ??
            require("@/assets/images/cover.jpg")
          }
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text size="lg" weight="semiBold" color={theme.colors.white[50]}>
            {title}
          </Text>
          <Text>{church}</Text>
          <Text>{tracks?.length ?? 0} Messages</Text>
          <Button style={styles.button}>
            <SolidIcons.PlayIcon color={theme.colors.grey[50]} />
            <Text>Play All</Text>
          </Button>
        </View>
      </View>
      <Text>{description}</Text>
      <View style={styles.trackContainer}>
        {tracks?.map((item, index) => (
          <TrackCard
            key={index + "trending"}
            {...item}
            variant="small"
            cardStyle={{
              width: "100%",
              borderBottomWidth: 0,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default PlayList;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    gap: theme.sizes.spacing.md,
  },
  textContainer: {
    gap: theme.sizes.spacing.sm,
  },
  container: {
    gap: theme.sizes.spacing.lg,
    padding: theme.sizes.spacing.md,
    borderRadius: theme.sizes.radius.md,
    backgroundColor: theme.colors.grey[600],
  },
  trackContainer: {
    gap: theme.sizes.spacing.xs,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: theme.sizes.radius.base,
  },
  button: {
    flexDirection: "row",
    borderRadius: theme.sizes.radius.full,
    gap: theme.sizes.spacing.sm,
    alignItems: "center",
    padding: theme.sizes.spacing.sm,
    backgroundColor: "#545454",
    justifyContent: "center",
    width: "70%",
  },
});
